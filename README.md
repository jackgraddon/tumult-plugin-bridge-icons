# Bridge Icons for Tumult

A [Tumult](https://github.com/jackgraddon/tumult) plugin that shows a small
circular platform icon after the name of a user bridged through a
[mautrix](https://mau.dev/mautrix) bridge — Discord, iMessage, Telegram,
WhatsApp, Signal, and friends.

A bridged Matrix ID usually starts with its platform's localpart, for example
`@discord_123456789012345678:example.org`. Rules match that MXID prefix and
render a coloured badge:

> Full Name **(discord icon)**

Rules are editable in a **Bridge Icons** settings tab, so a bridge set up with
a different prefix still works.

## Install

1. Install from Tumult: **Settings → Plugins → paste this repository URL**.
2. Tumult shows the consent screen. This plugin uses the `member-decorations`,
   `settings-tabs` and `styles` permissions, which puts it in the **trusted
   lane** — it contributes Vue components and runs in the page.
3. Open **Settings → Bridge Icons** to review or change the prefix rules.

The default rules cover Discord, iMessage, Telegram, WhatsApp, Signal,
Instagram, Facebook, Slack, X (Twitter), LinkedIn and Skype. Each rule has:

| field | meaning |
|---|---|
| enabled | whether the rule is used |
| MXID prefix | full prefix to match, e.g. `@discord_` |
| icon | one of the bundled brand icons |
| label | tooltip and accessible name, e.g. `Discord` |

Rules are checked in order and the first match wins. Edits save immediately to
`localStorage` under `cc.jackgraddon.tumult.bridge-icons.config.v1`; there is a
**Reset to defaults** button. Settings are per-browser, not synced between
devices.

## Where the icons show

- **Member list** — uses Tumult's supported `addMemberDecoration()` API. The
  badge appears at the end of the member row, including the members pane of a
  DM room.
- **DM list** — the left-hand Direct Messages list has no decoration API (its
  rows are rooms, not members). This plugin derives the other participant from
  the room's membership, tags the matching row, and draws the badge inside the
  name. It is best-effort and depends on Tumult's current `.tumult-dmlist`
  markup.
- **Timeline sender names** — Tumult has no sender-name decoration API, so this
  is best-effort injected CSS that matches the sender span's `title` attribute
  (the MXID). It works with Tumult's current `TimelineRow.vue` markup but may
  need updating if that markup changes. Long names ellipsize before the badge.

The member-list and timeline locations can be toggled independently in the
settings tab; the DM list follows the member-list toggle.

## Icons

Brand glyphs are vendored as SVG path data in `src/icons.ts` and drawn on a
brand-coloured circle. Most come from [Simple Icons](https://simpleicons.org)
([CC0](https://github.com/simple-icons/simple-icons/blob/develop/LICENSE.md)).
The iMessage speech bubble was extracted from
[`IMessage logo.svg` on Wikimedia Commons](https://commons.wikimedia.org/wiki/File:IMessage_logo.svg)
(public-domain text logo), so it reads cleanly at badge size. Everything is
inline: the plugin makes no network requests at runtime. The generated rules
use `data:image/svg+xml,…` URLs, which is what Tumult's stylesheet guard allows.

## Development

```sh
pnpm install
pnpm build          # writes dist/plugin.js
pnpm typecheck      # checks against the vendored plugin types
```

`src/index.ts` registers the decoration, settings tab and stylesheets.
`src/config.ts` owns the rules and persistence, `src/icons.ts` the artwork,
`src/components/` the two Vue components, `src/styles.ts` the base CSS,
`src/timeline.ts` generates the timeline/DM-list CSS, and `src/dmList.ts` tags
DM rows using the client's room membership.

Keep the manifest in `src/index.ts` and the release manifest
`tumult.plugin.json` in step. There is no `<style>` block in any SFC: the
release attaches only `plugin.js`, and the build refuses a sibling stylesheet.

To release, bump `version` in both manifests, push a tag matching it (for
example `v0.2.0`), and the release workflow builds, hashes and attaches
`plugin.js` and `tumult.plugin.json`.

## License

Do whatever you want with this plugin. The vendored Simple Icons paths are CC0;
the iMessage logo is a public-domain text logo.
