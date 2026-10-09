# Changelog

All notable changes to this project will hopefully be documented in this file. (No promises)

The format for this changelog is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).  
Dates use the [ISO 8601 date format](https://www.iso.org/iso-8601-date-and-time-format.html) of `YYYY-MM-DD`.

## [Unreleased]

### Added

- Inline icons in Gutenberg RichText (paragraph, heading, and other text toolbars)
- TinyMCE **Insert icon** button with the same picker and live preview

## [2.0.0] - 2026-10-09

### Added

- Gutenberg **Icon** block with library, name, size, color, and Lucide stroke width
- Material Symbols Outlined as a second bundled icon library
- Icon registry so more libraries can be added later
- Admin **Library** browser and top-level WP Icons menu
- `[wp_icon]` shortcode with a `library` attribute
- Optional cached CDN catalog refresh per library when the plugin bundle is stale

### Changed

- Icons render as inline SVG from catalogs stored in the plugin
- Settings moved under WP Icons and now configure defaults plus per-library source
- WordPress minimum version is 6.6

### Deprecated

- `[lucide_icon]` remains as a compatibility alias for Lucide icons

## [0.1.0] - 2026-10-07

[Unreleased]: https://github.com/kimlukasmyrvold/wp-lucide-icons/compare/2bdd0a5506cef1d946f8167a0cfa79423baf21d3...HEAD
[2.0.0]: https://github.com/kimlukasmyrvold/wp-lucide-icons/compare/2bdd0a5506cef1d946f8167a0cfa79423baf21d3...HEAD
[0.1.0]: https://github.com/kimlukasmyrvold/wp-lucide-icons/commit/2bdd0a5506cef1d946f8167a0cfa79423baf21d3
