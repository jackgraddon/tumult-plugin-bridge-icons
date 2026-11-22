/**
 * Badges on the left-hand Direct Messages list.
 *
 * Tumult has no room-list decoration API: those rows are `RoomSummary` rows,
 * not members, so they cannot receive a `MemberDecoration`. The right-hand
 * members pane of a DM *is* decorated already (it uses the shared
 * `MembersPane`). For the DM list itself this module derives the other person
 * in each one-to-one room from `client.members()`, tags the matching row with a
 * `data-bridge-icon` attribute, and lets generated CSS draw the badge. It is
 * best-effort and depends on Tumult's current `.tumult-dmlist` markup.
 */
import type { PluginContext, Subscription } from "@tumult/ui";
import { watch } from "vue";

import { config, matchRule } from "./config.ts";

interface RoomBadge {
    icon: string;
    label: string;
}

function current<T>(feed: { get(): T }): T | undefined {
    try {
        return feed.get();
    } catch {
        return undefined;
    }
}

function subscribe<T>(feed: { subscribe(listener: (value: T) => void): Subscription }, listener: (value: T) => void): Subscription | undefined {
    try {
        return feed.subscribe(listener);
    } catch {
        return undefined;
    }
}

/** Extract the room id from the `/dms/<encoded-id>` href on a DM row. */
function roomIdFromHref(href: string | null): string | undefined {
    if (!href) return undefined;
    try {
        const path = new URL(href, globalThis.location?.href ?? "http://localhost/").pathname;
        const match = /^\/dms\/([^/]+)\/?$/.exec(path);
        return match?.[1] ? decodeURIComponent(match[1]) : undefined;
    } catch {
        return undefined;
    }
}

export function startDmListBadges(ctx: PluginContext): () => void {
    if (typeof document === "undefined") return () => undefined;

    const badges = new Map<string, RoomBadge | undefined>();
    const memberSubscriptions = new Map<string, Subscription>();
    const requestedLoads = new Set<string>();
    let frame = 0;
    let disposed = false;

    function badgeForRoom(roomId: string): RoomBadge | undefined {
        const members = current(ctx.client.members(roomId)) ?? [];
        const other = members.find((member) => !member.isSelf && matchRule(member.userId));
        if (!other) return undefined;
        const rule = matchRule(other.userId);
        return rule ? { icon: rule.icon, label: rule.label } : undefined;
    }

    function refreshRoom(roomId: string): void {
        badges.set(roomId, badgeForRoom(roomId));
        scheduleApply();
    }

    function refreshRooms(): void {
        const rooms = current(ctx.client.rooms) ?? [];
        for (const room of rooms) {
            // `parentSpaceIds: []` is how Tumult identifies a DM/orphan room.
            if (room.parentSpaceIds.length > 0) continue;
            if (!memberSubscriptions.has(room.id)) {
                const sub = subscribe(ctx.client.members(room.id), () => refreshRoom(room.id));
                if (sub) memberSubscriptions.set(room.id, sub);
            }
            refreshRoom(room.id);

            // A lazy roster can be empty until the members pane opens. Fetch it
            // once so the DM list does not stay blank for bridged contacts.
            if (!badges.get(room.id) && !requestedLoads.has(room.id)) {
                requestedLoads.add(room.id);
                void Promise.resolve()
                    .then(() => ctx.client.loadMembers(room.id))
                    .catch(() => undefined);
            }
        }
        scheduleApply();
    }

    function apply(): void {
        frame = 0;
        if (disposed) return;
        const rows = document.querySelectorAll<HTMLElement>(".tumult-dmlist .tumult-room-item");
        for (const row of rows) {
            const roomId = roomIdFromHref(row.getAttribute("href"));
            const badge = roomId ? badges.get(roomId) : undefined;
            if (config.value.showInMemberList && badge) {
                row.dataset.bridgeIcon = badge.icon;
                row.dataset.bridgeLabel = badge.label;
            } else {
                delete row.dataset.bridgeIcon;
                delete row.dataset.bridgeLabel;
            }
        }
    }

    function scheduleApply(): void {
        if (disposed || frame) return;
        frame = globalThis.requestAnimationFrame(apply);
    }

    const observer = new MutationObserver(scheduleApply);
    observer.observe(document.documentElement, { childList: true, subtree: true });

    const roomsSub = subscribe(ctx.client.rooms, refreshRooms);
    const stopWatching = watch(config, refreshRooms, { deep: true });
    refreshRooms();

    return () => {
        disposed = true;
        observer.disconnect();
        if (frame) globalThis.cancelAnimationFrame(frame);
        roomsSub?.unsubscribe();
        for (const sub of memberSubscriptions.values()) sub.unsubscribe();
        memberSubscriptions.clear();
        stopWatching();
    };
}
