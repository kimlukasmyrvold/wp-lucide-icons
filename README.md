# WP Icons

A WordPress plugin for placing icons from [Lucide](https://lucide.dev/) and [Material Symbols](https://fonts.google.com/icons) (Outlined), with room to add more libraries later. Icons render as inline SVG.

The plugin is **WP Icons**. The repository and plugin folder are `wp-lucide-icons`.

- Requires WordPress 6.6+ and PHP 8.1+
- License: [GPLv2 or later](https://www.gnu.org/licenses/gpl-2.0.html)
- Site: [GitHub](https://github.com/kimlukasmyrvold/wp-lucide-icons)
- Issues: [GitHub](https://github.com/kimlukasmyrvold/wp-lucide-icons/issues)

## Features

- **Icon** block in the block editor
- **Insert icon** on paragraph, heading, and other RichText toolbars
- **Insert icon** button in the classic editor (TinyMCE)
- `[wp_icon]` shortcode
- Admin **Library** browser and **Settings**
- Bundled SVG catalogs, with an optional cached CDN refresh when the bundle is stale

In Flatsome UX Builder iframes, the plugin loads a small script so inline icons preview correctly.

## Requirements

|           |              |
| --------- | ------------ |
| WordPress | 6.6 or newer |
| PHP       | 8.1 or newer |

A release zip already includes `vendor/` and `build/`. A git checkout does not.

## Install

### From a release zip

1. Upload `wp-lucide-icons.zip` in **Plugins → Add New → Upload Plugin**, or extract it into `wp-content/plugins/wp-lucide-icons/`.
2. Activate **WP Icons**.

The zip must contain `vendor/autoload.php` and the `build/` bundles. Without the autoloader, the plugin shows an admin error and does not load.

### From git

Composer does not pull PHP packages. It only generates the PSR-4 autoloader (`WPIcons\` → `src/includes/`). `bootstrap.php` requires `vendor/autoload.php`.

```bash
composer install
pnpm install
pnpm build
pnpm sass:build
```

Then activate the plugin from that directory. See [Development](#development) for scripts and icon sync.

## Usage

### Block editor

Insert the **Icon** block. Choose a library, pick an icon, then set size, color, and (for Lucide) stroke width.

To place an icon inside a paragraph, heading, or other text, use the **Insert icon** control on the block toolbar. Inline icons follow the surrounding text size and color.

### Classic editor (TinyMCE)

Use the star **Insert icon** button on the TinyMCE toolbar. The same control appears in the Classic block and other TinyMCE fields.

### Shortcode

```
[wp_icon library="lucide" name="heart" size="24" color="currentColor" stroke="2"]
[wp_icon library="material-symbols" name="favorite" size="24" color="currentColor"]
```

| Attribute | Default                               | Notes                                                                |
| --------- | ------------------------------------- | -------------------------------------------------------------------- |
| `library` | Settings → default library (`lucide`) | `lucide` or `material-symbols`                                       |
| `name`    | `circle`                              | Icon name in that library                                            |
| `size`    | Settings (24)                         |                                                                      |
| `color`   | Settings (`currentColor`)             | CSS color                                                            |
| `stroke`  | Settings (2)                          | Lucide only                                                          |
| `width`   | empty                                 | Legacy alias for `stroke` when `stroke` is omitted                   |
| `class`   | empty                                 | Extra class on the SVG                                               |
| `title`   | empty                                 | Accessible title. Empty means the icon is hidden from assistive tech |

Omitted attributes fall back to **WP Icons → Settings**.

`[lucide_icon name="heart" size="24" color="currentColor" width="2"]` still works. It is a Lucide-only alias; prefer `[wp_icon]`.

## Admin

WP Icons adds a top-level menu (capability `manage_options`):

- **Library** — browse bundled icons, preview options, copy a shortcode
- **Settings** — defaults, which libraries are enabled, and per-library source

Each library source is either **plugin** (the catalog shipped in the plugin) or **cdn** (a newer npm catalog). CDN downloads are cached under `wp-content/uploads/wp-icons/` by a daily cron job and are never fetched during page views. If the cache is empty, the plugin uses the bundled catalog.

## Development

You need PHP 8.1+, [Composer](https://getcomposer.org/), Node.js, and [pnpm](https://pnpm.io/).

```bash
composer install
pnpm install
pnpm sync-icons   # only when regenerating bundled icon maps
pnpm build
pnpm sass:build
```

While editing, `pnpm start` rebuilds the JavaScript bundles, and `pnpm sass` watches SCSS.

### Scripts

| Command                    | What it does                                                                                     |
| -------------------------- | ------------------------------------------------------------------------------------------------ |
| `pnpm start`               | `@wordpress/scripts` in watch mode. Writes `build/` (Icon block, admin library, TinyMCE picker). |
| `pnpm build`               | Production build of the same bundles.                                                            |
| `pnpm sass`                | Watch `src/assets/scss` and write compressed CSS to `src/assets/css`.                            |
| `pnpm sass:build`          | One-shot SCSS compile.                                                                           |
| `pnpm sync-icons`          | Download Lucide and Material Symbols and rewrite the generated PHP maps.                         |
| `pnpm sync-icons:lucide`   | Lucide only (`lucide-static`).                                                                   |
| `pnpm sync-icons:material` | Material Symbols Outlined only (`@material-symbols/svg-400`).                                    |
| `pnpm publish`             | Zip a release with `node publish.js wp-lucide-icons.php`. This is not `npm publish`.             |

Pass a version after `--` to pin a catalog. Without one, the script uses `latest`:

```bash
pnpm sync-icons:lucide -- 1.52.0
pnpm sync-icons:material -- 0.48.0
```

Do not hand-edit the generated files:

- `src/includes/Icons/LucideIcon.php`
- `src/includes/Icons/Material/material-symbols-outlined-map.php`

### Composer

`composer.json` requires PHP `>=8.1` and autoloads `WPIcons\` from `src/includes/`. There are no Composer packages.

```bash
composer install
composer dump-autoload
```

Before packing a release zip, regenerate an optimized autoloader:

```bash
composer install --no-dev --optimize-autoloader
```

`vendor/` is gitignored. A checkout without `composer install` will not run.

## Release zip

`publish.js` reads the `Version:` header in `wp-lucide-icons.php` and writes `releases/v{version}/wp-lucide-icons.zip`. It does not bump the version, create a git tag, or upload the zip.

1. Update the version in both places in `wp-lucide-icons.php`: the `Version:` header and the `WP_ICONS__VERSION` constant.
2. Update `package.json` and [CHANGELOG.md](CHANGELOG.md).
3. Build what the zip must contain:

```bash
composer install --no-dev --optimize-autoloader
pnpm build
pnpm sass:build
pnpm publish
```

The zip includes:

- `wp-lucide-icons.php`, `bootstrap.php`, `uninstall.php`
- `src/assets/css`, `src/assets/js`, `src/includes`, `src/languages`, `src/templates`
- `build/`
- `vendor/`

It omits `node_modules`, `scripts/`, SCSS, Composer and npm config, this README, the changelog, and `publish.js`.

Run `pnpm sync-icons` before that sequence when the bundled catalogs should change.

## PHP

Theme and plugin code can render an icon without a shortcode:

```php
use WPIcons\Icons\Renderer;

echo (new Renderer())->fromAttributes([
    'library' => 'lucide', // or material-symbols
    'name'    => 'heart',
    'size'    => 24,
    'color'   => 'currentColor',
    'stroke'  => 2,        // Lucide only
    'class'   => '',
    'title'   => 'Favorite',
]);
```

Library ids are `lucide` (size, color, stroke) and `material-symbols` (size, color). An unknown name or a disabled library returns an empty string.

## Changelog

See [CHANGELOG.md](CHANGELOG.md).
