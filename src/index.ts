/**
 * Bridge Icons — show circular platform badges after bridged users' names.
 *
 * Member-list badges use the supported member-decoration API. Timeline sender
 * names and DM-list rows have no decoration API, so those use generated CSS
 * (keyed on the sender MXID and a tagged DM row respectively); see `timeline.ts`
 * and `dmList.ts` for the caveats.
 */
import type { Plugin, PluginManifest } from "@tumult/ui";
import { watch } from "vue";

import BridgeBadge from "./components/BridgeBadge.vue";
import SettingsTab from "./components/SettingsTab.vue";
import { config } from "./config.ts";
import { startDmListBadges } from "./dmList.ts";
import { BASE_STYLES } from "./styles.ts";
import { generatedStyles } from "./timeline.ts";

const manifest: PluginManifest = {
    id: "cc.jackgraddon.tumult.bridge-icons",
    name: "Bridge Icons",
    version: "0.2.0",
    author: "Jack Graddon",
    description: "Show circular bridge icons next to bridged users' names in the member list, DM list and timeline.",
    permissions: ["member-decorations", "settings-tabs", "styles"],
};

export const plugin: Plugin = {
    manifest,

    install(ctx) {
        const disposers: Array<() => void> = [];

        disposers.push(ctx.injectStylesheet(BASE_STYLES));

        let disposeGenerated = ctx.injectStylesheet(generatedStyles(config.value));
        disposers.push(() => disposeGenerated());

        // Rebuild just the generated timeline/DM-list rules when settings
        // change; the base stylesheet and registrations stay put.
        disposers.push(
            watch(
                config,
                () => {
                    disposeGenerated();
                    disposeGenerated = ctx.injectStylesheet(generatedStyles(config.value));
                },
                { deep: true },
            ),
        );

        disposers.push(startDmListBadges(ctx));

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
