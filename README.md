# WP Icons

A WordPress plugin for placing icons from Lucide Icons and Material Symbols (Outlined), with room to add more libraries later. Requires WordPress 6.6+ and PHP 8.1+.

## Usage

### Block editor

Insert the **Icon** block. Choose a library, pick an icon, then set size, color, and (for Lucide) stroke width.

### Shortcode

```
[wp_icon library="lucide" name="heart" size="24" color="currentColor" stroke="2"]
[wp_icon library="material-symbols" name="favorite" size="24" color="currentColor"]
```

`[lucide_icon name="heart" size="24" color="currentColor" width="2"]` still works as a Lucide-only alias.

## Admin

WP Icons adds a top-level menu:

- **Library** — browse bundled icons, preview options, copy a shortcode
- **Settings** — defaults and per-library source (plugin bundle or cached CDN)

Icons ship inside the plugin. CDN is optional for sites that have not updated the plugin and need a newer catalog. CDN downloads are cached locally and are never fetched during page views.

## Development

```
pnpm install
pnpm sync-icons
pnpm build
pnpm sass:build
```
