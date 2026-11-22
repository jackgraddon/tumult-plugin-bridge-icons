<script setup lang="ts">
import { computed } from "vue";
import type { MemberDecorationProps } from "@tumult/ui";

import { config } from "../config.ts";
import { findIcon } from "../icons.ts";

const props = defineProps<MemberDecorationProps>();

// The component (rather than `match`) does the filtering: `match` is cached by
// the host per roster rebuild, so it would not react to settings edits.
const rule = computed(() => {
    if (!config.value.showInMemberList) return undefined;
    const userId = props.member.userId.toLowerCase();
    return config.value.rules.find(
        (candidate) =>
            candidate.enabled && candidate.prefix.trim() !== "" && userId.startsWith(candidate.prefix.toLowerCase()),
    );
});

const icon = computed(() => (rule.value ? findIcon(rule.value.icon) : undefined));
const label = computed(() => `${rule.value?.label ?? "Bridge"} bridge`);
</script>

<template>
    <span
        v-if="rule && icon"
        class="tumult-bridge-badge"
        :style="{ backgroundColor: icon.color }"
        role="img"
        :aria-label="label"
        :title="label"
    >
        <svg
            :viewBox="`0 0 ${icon.viewBox ?? 24} ${icon.viewBox ?? 24}`"
            aria-hidden="true"
            focusable="false"
        >
            <path :d="icon.path" />
        </svg>
    </span>
</template>
