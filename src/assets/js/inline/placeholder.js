export const INLINE_CLASS = 'wpicons-inline';

export const TRANSPARENT_SRC =
    'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

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
    const bytes = new TextEncoder().encode(String(svg || '').trim());
    let binary = '';
    bytes.forEach((byte) => {
        binary += String.fromCharCode(byte);
    });

    return 'data:image/svg+xml;base64,' + window.btoa(binary);
}

export function iconMaskStyle(url) {
    return `--wpicons-src:url("${String(url)}")`;
}

export function placeholderAttributes({
    library,
    name,
    svg,
    color,
    stroke,
}) {
    const defaults = pluginDefaults();
    const url = svgToDataUri(svg);

    return {
        url,
        src: TRANSPARENT_SRC,
        alt: '',
        iconStyle: iconMaskStyle(url),
        library: String(library || defaults.library || 'lucide'),
        iconName: String(name || ''),
        color: String(color || defaults.color || 'currentColor'),
        stroke: String(stroke ?? defaults.stroke ?? 2),
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
        ` alt="" />`
    );
}

export function migrateInlineIconHtml(html) {
    if (!html || !html.includes('wpicons-inline') || !html.includes('<span')) {
        return html;
    }

    return html.replace(/<span\b(?=[^>]*\bwpicons-inline\b)[^>]*>[\s\S]*?<\/span>/gi, (full) => {
        const openEnd = full.indexOf('>');
        const open = full.slice(0, openEnd + 1);
        const inner = full.slice(openEnd + 1, full.length - '</span>'.length);
        const url = iconUrl(open);
        const iconName = readAttr(open, 'data-name');
        if (!url || !iconName) {
            return full;
        }

        const defaults = pluginDefaults();

        return (
            `<img class="${INLINE_CLASS}"` +
            ` src="${escapeAttr(TRANSPARENT_SRC)}"` +
            ` data-src="${escapeAttr(url)}"` +
            ` style="${escapeAttr(iconMaskStyle(url))}"` +
            ` data-library="${escapeAttr(readAttr(open, 'data-library') || defaults.library || 'lucide')}"` +
            ` data-name="${escapeAttr(iconName)}"` +
            ` data-color="${escapeAttr(readAttr(open, 'data-color') || defaults.color || 'currentColor')}"` +
            ` data-stroke="${escapeAttr(readAttr(open, 'data-stroke') || String(defaults.stroke ?? 2))}"` +
            ` alt="" />` +
            inner
        );
    });
}

function iconUrl(tag) {
    const src = readAttr(tag, 'data-src') || readAttr(tag, 'src');
    if (src && src.startsWith('data:image/svg+xml')) {
        return src;
    }

    const style = readAttr(tag, 'style');
    const match = style.match(/url\((?:&quot;|"|')?(data:image\/svg\+xml[^"')]+)/i);
    return match ? match[1] : src;
}

function readAttr(tag, name) {
    const match = tag.match(new RegExp(`\\s${name}\\s*=\\s*("|')([\\s\\S]*?)\\1`, 'i'));
    return match ? match[2] : '';
}

function escapeAttr(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
