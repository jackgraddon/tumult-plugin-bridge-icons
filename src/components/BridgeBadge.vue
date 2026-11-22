<script setup lang="ts">
import { computed } from "vue";
import type { MemberDecorationProps } from "@tumult/ui";

import { config, matchRule } from "../config.ts";
import { findIcon } from "../icons.ts";

const props = defineProps<MemberDecorationProps>();

// The component (rather than `match`) does the filtering: `match` is cached by
// the host per roster rebuild, so it would not react to settings edits.
const rule = computed(() => {
    if (!config.value.showInMemberList) return undefined;
    return matchRule(props.member.userId);
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
        <svg :viewBox="icon.viewBox ?? '0 0 24 24'" aria-hidden="true" focusable="false">
            <path :d="icon.path" :transform="icon.transform" />
        </svg>
    </span>
</template>
