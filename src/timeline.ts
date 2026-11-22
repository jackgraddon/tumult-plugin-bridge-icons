/**
 * Timeline sender badges.
 *
 * Tumult has no sender-name decoration API, so this is a best-effort CSS
 * addition: the sender span in `TimelineRow.vue` carries the full MXID in its
 * `title` attribute, which lets an attribute selector pick out bridged users
 * without touching the DOM. It depends on that internal markup staying the
 * same; member-list badges use the supported member-decoration API instead.
 */
import type { BridgeIconsConfig } from "./config.ts";
import { findIcon, iconDataUrl } from "./icons.ts";

/** Quote a value for use as a CSS string. */
function cssString(value: string): string {
    return JSON.stringify(value);
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

        blocks.push(
            `.tumult-row-sender[title^=${cssString(prefix)}]::after {` +
                `content: "";` +
                `display: inline-block;` +
                `flex: 0 0 auto;` +
                `width: 1.05em;` +
                `height: 1.05em;` +
                `margin-inline-start: 0.35em;` +
                `border-radius: 50%;` +
                `background-color: ${icon.color};` +
                `background-image: url("${iconDataUrl(icon)}");` +
                `background-position: center;` +
                `background-repeat: no-repeat;` +
                `background-size: 0.68em 0.68em;` +
                `vertical-align: -0.16em;` +
                `}`,
        );
    }

    if (blocks.length === 0) return "";
    return `/* Bridge Icons — generated from settings; do not edit by hand. */\n${blocks.join("\n")}\n`;
}
