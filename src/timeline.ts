/**
 * CSS for the two places Tumult has no decoration API for.
 *
 * - Timeline sender names: current `TimelineRow.vue` puts the full MXID in the
 *   sender span's `title` attribute, so an attribute selector is enough.
 * - DM list rows: `dmList.ts` tags the right rows with `data-bridge-icon`, and
 *   these rules draw the matching badge inside the room name.
 *
 * Member-list badges use the supported member-decoration API instead. All of
 * this depends on Tumult's current internal markup staying the same.
 */
import type { BridgeIconsConfig } from "./config.ts";
import { badgeDataUrl, findIcon, type BridgeIcon } from "./icons.ts";

/** Quote a value for use as a CSS string. */
function cssString(value: string): string {
    return JSON.stringify(value);
}

function badgeBackground(selector: string, icon: BridgeIcon): string {
    return (
        `${selector} {` +
        `content: "";` +
        `display: inline-block;` +
        `flex: 0 0 auto;` +
        `width: 1.05em;` +
        `height: 1.05em;` +
        `margin-inline-start: 0.35em;` +
        `border-radius: 50%;` +
        `background-image: url("${badgeDataUrl(icon)}");` +
        `background-position: center;` +
        `background-repeat: no-repeat;` +
        `background-size: contain;` +
        `vertical-align: -0.16em;` +
        `}`
    );
}

export function timelineStyles(config: BridgeIconsConfig): string {
    if (!config.showInTimeline) return "";

    const seen = new Set<string>();
    const blocks: string[] = [];

    for (const rule of config.rules) {
        const prefix = rule.prefix.trim();
        // First matching rule wins, matching the member-list decoration.
        if (!rule.enabled || !prefix || seen.has(prefix)) continue;
        const icon = findIcon(rule.icon);
        if (!icon) continue;
        seen.add(prefix);

        blocks.push(badgeBackground(`.tumult-row-sender[title^=${cssString(prefix)}]::after`, icon));
    }

    if (blocks.length === 0) return "";
    return `/* Bridge Icons — timeline rules */\n${blocks.join("\n")}\n`;
}

export function dmListStyles(config: BridgeIconsConfig): string {
    if (!config.showInMemberList) return "";

    const seen = new Set<string>();
    const blocks: string[] = [];

    for (const rule of config.rules) {
        if (!rule.enabled || seen.has(rule.icon)) continue;
        const icon = findIcon(rule.icon);
        if (!icon) continue;
        seen.add(rule.icon);

        // A background keeps the circle visible even when the name ellipsizes.
        blocks.push(
            `.tumult-dmlist .tumult-room-item[data-bridge-icon=${cssString(rule.icon)}] .tumult-room-name {` +
                `padding-inline-end: 1.3em;` +
                `background-image: url("${badgeDataUrl(icon)}");` +
                `background-position: right center;` +
                `background-repeat: no-repeat;` +
                `background-size: 1.05em 1.05em;` +
                `}`,
        );
    }

    if (blocks.length === 0) return "";
    return `/* Bridge Icons — DM list rules */\n${blocks.join("\n")}\n`;
}

/** Both config-dependent stylesheets, kept in one injection. */
export function generatedStyles(config: BridgeIconsConfig): string {
    return [timelineStyles(config), dmListStyles(config)].filter(Boolean).join("\n");
}
