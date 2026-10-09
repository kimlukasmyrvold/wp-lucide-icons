export const INLINE_CLASS = 'wpicons-inline';

export function pluginDefaults() {
    return (
        window.WPIconsAdmin?.defaults || {
            library: 'lucide',
            size: 24,
            color: 'currentColor',
            stroke: 2,
        }
    );
}

export function svgToDataUri(svg) {
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(String(svg || '').trim());
}

export function placeholderAttributes({
    library,
    name,
    svg,
    color,
    stroke,
}) {
    const defaults = pluginDefaults();

    return {
        url: svgToDataUri(svg),
        library: String(library || defaults.library || 'lucide'),
        iconName: String(name || ''),
        color: String(color || defaults.color || 'currentColor'),
        stroke: String(stroke ?? defaults.stroke ?? 2),
        alt: '',
    };
}

export function placeholderHtml(icon) {
    const attrs = placeholderAttributes(icon);

    return (
        `<img class="${INLINE_CLASS}"` +
        ` src="${escapeAttr(attrs.url)}"` +
        ` data-library="${escapeAttr(attrs.library)}"` +
        ` data-name="${escapeAttr(attrs.iconName)}"` +
        ` data-color="${escapeAttr(attrs.color)}"` +
        ` data-stroke="${escapeAttr(attrs.stroke)}"` +
        ` alt=""` +
        ` />`
    );
}

function escapeAttr(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
