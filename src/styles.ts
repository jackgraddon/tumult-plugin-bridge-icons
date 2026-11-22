/**
 * Styles injected with `ctx.injectStylesheet()`.
 *
 * SFC `<style>` blocks are extracted into a sibling file that the release does
 * not attach, so every rule this plugin needs lives in this string instead.
 * The timeline rules are generated separately in `timeline.ts`.
 */
export const BASE_STYLES = `
/* Member-list decoration — a circular brand badge after the display name. */
.tumult-bridge-badge {
    display: inline-flex;
    flex: 0 0 auto;
    width: 1.15em;
    height: 1.15em;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-radius: 50%;
    color: #ffffff;
    font-size: 0.85em;
    line-height: 1;
    vertical-align: middle;
}
.tumult-bridge-badge svg {
    width: 72%;
    height: 72%;
    fill: currentColor;
}

/* Settings tab. */
.bi-settings {
    display: flex;
    max-width: 60rem;
    flex-direction: column;
    gap: var(--space-4, 1rem);
    padding: var(--space-4, 1rem);
    color: var(--text-primary, inherit);
}
.bi-settings h2 {
    margin: 0;
    font-size: var(--text-lg, 1.25rem);
}
.bi-settings p {
    margin: 0;
    color: var(--text-secondary, inherit);
    line-height: 1.5;
}
.bi-settings-toggle {
    display: flex;
    align-items: center;
    gap: var(--space-2, 0.5rem);
}
.bi-settings-rules {
    display: flex;
    flex-direction: column;
    gap: var(--space-2, 0.5rem);
}
.bi-rule {
    display: grid;
    grid-template-columns: auto 2.5rem minmax(9rem, 1fr) minmax(9rem, 1fr) minmax(9rem, 1fr) auto;
    gap: var(--space-2, 0.5rem);
    align-items: center;
    padding: var(--space-2, 0.5rem);
    border: var(--border-width, 1px) solid var(--border-default, #444);
    border-radius: var(--control-radius, 0.375rem);
}
.bi-rule[data-enabled="false"] {
    opacity: 0.55;
}
.bi-rule label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    color: var(--text-muted, inherit);
    font-size: var(--text-xs, 0.75rem);
}
.bi-rule input[type="text"],
.bi-rule select {
    min-width: 0;
    padding: var(--space-1, 0.25rem) var(--space-2, 0.5rem);
    border: var(--border-width, 1px) solid var(--border-default, #444);
    border-radius: var(--control-radius, 0.375rem);
    background: var(--bg-input, inherit);
    color: inherit;
    font: inherit;
}
.bi-icon-preview {
    display: inline-flex;
    width: 1.5rem;
    height: 1.5rem;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    color: #ffffff;
}
.bi-icon-preview svg {
    width: 72%;
    height: 72%;
    fill: currentColor;
}
.bi-button {
    padding: var(--space-1, 0.25rem) var(--space-3, 0.75rem);
    border: var(--border-width, 1px) solid var(--border-default, #444);
    border-radius: var(--control-radius, 0.375rem);
    background: var(--bg-input, transparent);
    color: inherit;
    font: inherit;
    cursor: pointer;
}
.bi-button:hover {
    background: var(--roomlist-item-bg-hover, rgba(127, 127, 127, 0.15));
}
.bi-button-danger {
    color: var(--danger, #e06c75);
}
.bi-settings-actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2, 0.5rem);
}
.bi-sr-only {
    position: absolute;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
}
`;
