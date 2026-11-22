/**
 * Bridge Icons — show circular platform badges after bridged users' names.
 *
 * Member-list badges use the supported member-decoration API. Timeline sender
 * names have no decoration API, so those come from injected CSS keyed on the
 * sender span's `title` (the MXID); see `timeline.ts` for the caveat.
 */
import type { Plugin, PluginManifest } from "@tumult/ui";
import { watch } from "vue";

import BridgeBadge from "./components/BridgeBadge.vue";
import SettingsTab from "./components/SettingsTab.vue";
import { config } from "./config.ts";
import { BASE_STYLES } from "./styles.ts";
import { timelineStyles } from "./timeline.ts";

const manifest: PluginManifest = {
    id: "cc.jackgraddon.tumult.bridge-icons",
    name: "Bridge Icons",
    version: "0.1.0",
    author: "Jack Graddon",
    description: "Show circular bridge icons next to bridged users' names in the member list and timeline.",
    permissions: ["member-decorations", "settings-tabs", "styles"],
};

export const plugin: Plugin = {
    manifest,

    install(ctx) {
        const disposers: Array<() => void> = [];

        disposers.push(ctx.injectStylesheet(BASE_STYLES));

        let disposeTimeline = ctx.injectStylesheet(timelineStyles(config.value));
        disposers.push(() => disposeTimeline());

        // Rebuild just the generated timeline rules when settings change; the
        // base stylesheet and registrations stay put.
        disposers.push(
            watch(
                config,
                () => {
                    disposeTimeline();
                    disposeTimeline = ctx.injectStylesheet(timelineStyles(config.value));
                },
                { deep: true },
            ),
        );

        disposers.push(
            ctx.addMemberDecoration({
                id: "cc.jackgraddon.tumult.bridge-icons.badge",
                component: BridgeBadge,
            }),
        );

        disposers.push(
            ctx.addSettingsTab({
                id: "cc.jackgraddon.tumult.bridge-icons.settings",
                title: "Bridge Icons",
                component: SettingsTab,
            }),
        );

        return () => {
            for (const dispose of disposers.reverse()) dispose();
        };
    },
};

export default plugin;
