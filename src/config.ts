/**
 * What the user configured, and where it lives.
 *
 * There is no plugin-settings storage API yet, so rules are kept in
 * `localStorage` under a namespaced key — the same approach the other Tumult
 * plugins use. The config is a host-Vue `ref` so the decoration component and
 * the settings tab re-render immediately when a rule changes.
 */
import { ref, watch, type Ref } from "vue";

const STORAGE_KEY = "cc.jackgraddon.tumult.bridge-icons.config.v1";

export interface BridgeRule {
    /** Stable id, used as the Vue key in the settings list. */
    id: string;
    /** Full MXID prefix, e.g. `@discord_` or `@imessage_`. */
    prefix: string;
    /** One of the ids in `BRIDGE_ICONS`. */
    icon: string;
    /** Tooltip / accessible name, e.g. `Discord`. */
    label: string;
    enabled: boolean;
}

export interface BridgeIconsConfig {
    version: 1;
    rules: BridgeRule[];
    showInMemberList: boolean;
    showInTimeline: boolean;
}

/** Sensible defaults for the common mautrix bridges. */
export function createDefaultConfig(): BridgeIconsConfig {
    return {
        version: 1,
        rules: [
            rule("@discord_", "discord", "Discord"),
            rule("@imessage_", "imessage", "iMessage"),
            rule("@telegram_", "telegram", "Telegram"),
            rule("@whatsapp_", "whatsapp", "WhatsApp"),
            rule("@signal_", "signal", "Signal"),
            rule("@instagram_", "instagram", "Instagram"),
            rule("@facebook_", "facebook", "Facebook"),
            rule("@slack_", "slack", "Slack"),
            rule("@twitter_", "x", "X (Twitter)"),
            rule("@linkedin_", "linkedin", "LinkedIn"),
            rule("@skype_", "skype", "Skype"),
        ],
        showInMemberList: true,
        showInTimeline: true,
    };
}

function rule(prefix: string, icon: string, label: string): BridgeRule {
    return { id: newId(), prefix, icon, label, enabled: true };
}

export function newId(): string {
    if (typeof globalThis.crypto?.randomUUID === "function") return globalThis.crypto.randomUUID();
    return `rule-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function storage(): Storage | null {
    try {
        return globalThis.localStorage ?? null;
    } catch {
        // Some privacy modes throw on access rather than returning null.
        return null;
    }
}

/** Load saved rules, falling back to defaults for missing or corrupt data. */
export function loadConfig(): BridgeIconsConfig {
    const store = storage();
    if (!store) return createDefaultConfig();
    try {
        const raw = store.getItem(STORAGE_KEY);
        if (!raw) return createDefaultConfig();
        const parsed = JSON.parse(raw) as Partial<BridgeIconsConfig>;
        if (!Array.isArray(parsed.rules)) return createDefaultConfig();
        const rules = (parsed.rules as unknown[])
            .filter((entry): entry is Partial<BridgeRule> => typeof entry === "object" && entry !== null)
            .filter((entry) => typeof entry.prefix === "string" && entry.prefix.trim() !== "")
            .map((entry) => ({
                id: typeof entry.id === "string" && entry.id ? entry.id : newId(),
                prefix: entry.prefix!.trim(),
                icon: typeof entry.icon === "string" ? entry.icon : "discord",
                label: typeof entry.label === "string" && entry.label ? entry.label : entry.prefix!.trim(),
                enabled: entry.enabled !== false,
            }));
        return {
            version: 1,
            rules,
            showInMemberList: parsed.showInMemberList !== false,
            showInTimeline: parsed.showInTimeline !== false,
        };
    } catch {
        return createDefaultConfig();
    }
}

export function saveConfig(value: BridgeIconsConfig): void {
    const store = storage();
    if (!store) return;
    try {
        store.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch {
        // A full or blocked storage must not break the UI.
    }
}

export const config: Ref<BridgeIconsConfig> = ref(loadConfig());

// Auto-save every edit. The watcher lives at module scope because the config
// has the same lifetime as the installed plugin, not as any one component.
watch(config, (value) => saveConfig(value), { deep: true });

export function resetConfig(): void {
    config.value = createDefaultConfig();
}

/** First enabled rule whose full MXID prefix matches `userId` (case-insensitive). */
export function matchRule(userId: string, value: BridgeIconsConfig = config.value): BridgeRule | undefined {
    const lower = userId.toLowerCase();
    return value.rules.find(
        (candidate) =>
            candidate.enabled && candidate.prefix.trim() !== "" && lower.startsWith(candidate.prefix.trim().toLowerCase()),
    );
}
