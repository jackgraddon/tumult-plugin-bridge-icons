<script setup lang="ts">
import { ref } from "vue";

import { config, newId, resetConfig, type BridgeRule } from "../config.ts";
import { BRIDGE_ICONS, findIcon } from "../icons.ts";

const newPrefix = ref("@");
const newIcon = ref(BRIDGE_ICONS[0]?.id ?? "discord");

function addRule(): void {
    const prefix = newPrefix.value.trim();
    if (!prefix) return;
    const icon = findIcon(newIcon.value);
    const created: BridgeRule = {
        id: newId(),
        prefix,
        icon: newIcon.value,
        label: icon?.label ?? prefix,
        enabled: true,
    };
    config.value.rules.push(created);
    newPrefix.value = "@";
}

function removeRule(id: string): void {
    config.value.rules = config.value.rules.filter((rule) => rule.id !== id);
}

function iconFor(id: string) {
    return findIcon(id) ?? BRIDGE_ICONS[0];
}
</script>

<template>
    <div class="bi-settings">
        <h2>Bridge Icons</h2>
        <p>
            Show a circular bridge icon after users whose Matrix ID starts with a configured prefix. Rules are checked
            in order; the first match wins. Changes save automatically in this browser.
        </p>

        <label class="bi-settings-toggle">
            <input v-model="config.showInMemberList" type="checkbox" />
            Show icons in the member list
        </label>
        <label class="bi-settings-toggle">
            <input v-model="config.showInTimeline" type="checkbox" />
            Show icons after sender names in the timeline
        </label>

        <div class="bi-settings-rules">
            <div v-for="rule in config.rules" :key="rule.id" class="bi-rule" :data-enabled="rule.enabled">
                <input v-model="rule.enabled" type="checkbox" :aria-label="`Enable ${rule.prefix}`" />

                <span class="bi-icon-preview" :style="{ backgroundColor: iconFor(rule.icon)?.color }">
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <path :d="iconFor(rule.icon)?.path ?? ''" />
                    </svg>
                </span>

                <label>
                    <span>MXID prefix</span>
                    <input v-model="rule.prefix" type="text" spellcheck="false" placeholder="@discord_" />
                </label>

                <label>
                    <span>Icon</span>
                    <select v-model="rule.icon">
                        <option v-for="option in BRIDGE_ICONS" :key="option.id" :value="option.id">
                            {{ option.label }}
                        </option>
                    </select>
                </label>

                <label>
                    <span>Label</span>
                    <input v-model="rule.label" type="text" placeholder="Discord" />
                </label>

                <button type="button" class="bi-button bi-button-danger" @click="removeRule(rule.id)">Remove</button>
            </div>
        </div>

        <div class="bi-settings-actions">
            <label>
                <span class="bi-sr-only">New MXID prefix</span>
                <input v-model="newPrefix" type="text" spellcheck="false" placeholder="@prefix_" />
            </label>
            <select v-model="newIcon" aria-label="Icon for the new rule">
                <option v-for="option in BRIDGE_ICONS" :key="option.id" :value="option.id">
                    {{ option.label }}
                </option>
            </select>
            <button type="button" class="bi-button" @click="addRule">Add rule</button>
            <button type="button" class="bi-button" @click="resetConfig">Reset to defaults</button>
        </div>
    </div>
</template>
