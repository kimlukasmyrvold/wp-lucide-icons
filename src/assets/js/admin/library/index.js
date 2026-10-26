import { createRoot, render, useEffect, useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Button, RangeControl, TextControl, ToggleControl } from '@wordpress/components';
import IconPicker from '../../picker/IconPicker';
import { fetchIcon, fetchLibraries } from '../../picker/api';

const pluginDefaults = window.WPIconsAdmin?.defaults || {
    library: 'lucide',
    size: 24,
    color: 'currentColor',
    stroke: 2,
};

function paintIcon(svg, { size, color, stroke, supportsStroke }) {
    if (!svg || typeof DOMParser === 'undefined') {
        return svg || '';
    }

    const doc = new DOMParser().parseFromString(svg, 'image/svg+xml');
    const root = doc.querySelector('svg');
    if (!root || doc.querySelector('parsererror')) {
        return svg;
    }

    const pixels = Number(size) > 0 ? String(Math.round(Number(size))) : '24';
    root.setAttribute('width', pixels);
    root.setAttribute('height', pixels);

    const paint = color || 'currentColor';
    const strokeAttr = root.getAttribute('stroke');
    const fill = root.getAttribute('fill');
    if (strokeAttr && strokeAttr !== 'none') {
        root.setAttribute('stroke', paint);
    }
    if (fill && fill !== 'none') {
        root.setAttribute('fill', paint);
    }
    if (supportsStroke && root.hasAttribute('stroke-width')) {
        root.setAttribute('stroke-width', String(stroke ?? 2));
    }

    return root.outerHTML;
}

function LibraryApp() {
    const [library, setLibrary] = useState(pluginDefaults.library);
    const [name, setName] = useState('circle');
    const [size, setSize] = useState(pluginDefaults.size);
    const [color, setColor] = useState(pluginDefaults.color);
    const [stroke, setStroke] = useState(pluginDefaults.stroke);
    const [useCurrentColor, setUseCurrentColor] = useState(true);
    const [supportsStroke, setSupportsStroke] = useState(true);
    const [sourceSvg, setSourceSvg] = useState('');
    const [copied, setCopied] = useState('');

    const shortcode = useMemo(() => {
        const attrs = [
            `library="${library}"`,
            `name="${name}"`,
            `size="${size}"`,
            `color="${useCurrentColor ? 'currentColor' : color}"`,
        ];
        if (supportsStroke) {
            attrs.push(`stroke="${stroke}"`);
        }
        return `[wp_icon ${attrs.join(' ')}]`;
    }, [library, name, size, color, stroke, useCurrentColor, supportsStroke]);

    const preview = useMemo(() => paintIcon(sourceSvg, {
        size,
        color: useCurrentColor ? 'currentColor' : color,
        stroke,
        supportsStroke,
    }), [sourceSvg, size, color, stroke, useCurrentColor, supportsStroke]);

    useEffect(() => {
        fetchLibraries()
            .then((data) => {
                const current = (data.libraries || []).find((item) => item.id === library);
                setSupportsStroke(Boolean(current?.supports?.includes('stroke')));
            })
            .catch(() => {});
    }, [library]);

    useEffect(() => {
        if (sourceSvg) {
            return undefined;
        }

        let cancelled = false;
        fetchIcon({
            library,
            name,
            size: 24,
            color: 'currentColor',
            stroke: 2,
        })
            .then((data) => {
                if (!cancelled && data.svg) {
                    setSourceSvg(data.svg);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setSourceSvg('');
                }
            });

        return () => {
            cancelled = true;
        };
    }, [library, name, sourceSvg]);

    async function copyText(text, key) {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(key);
            window.setTimeout(() => setCopied(''), 2000);
        } catch (error) {
            setCopied('');
        }
    }

    return (
        <div className="wpicons__library__app">
            <div className="wpicons__library__picker">
                <IconPicker
                    library={library}
                    name={name}
                    onLibraryChange={(nextLibrary) => {
                        setLibrary(nextLibrary);
                        setSourceSvg('');
                    }}
                    onSelect={(icon) => {
                        setLibrary(icon.library);
                        setName(icon.name);
                        setSourceSvg(icon.svg || '');
                    }}
                />
            </div>
            <aside className="wpicons__library__detail">
                <h2>{__('Selected icon', 'wpicons')}</h2>
                <div
                    className="wpicons__library__preview"
                    dangerouslySetInnerHTML={{ __html: preview }}
                />
                <p>
                    <strong>{library}</strong>
                    <br />
                    {name}
                </p>
                <RangeControl
                    label={__('Size', 'wpicons')}
                    value={size}
                    min={8}
                    max={256}
                    onChange={setSize}
                />
                <ToggleControl
                    label={__('Inherit text color', 'wpicons')}
                    checked={useCurrentColor}
                    onChange={(checked) => {
                        setUseCurrentColor(checked);
                        if (checked) {
                            setColor('currentColor');
                        } else if (color === 'currentColor') {
                            setColor('#1e1e1e');
                        }
                    }}
                />
                {!useCurrentColor ? (
                    <TextControl
                        label={__('Color', 'wpicons')}
                        value={color}
                        onChange={setColor}
                    />
                ) : null}
                {supportsStroke ? (
                    <RangeControl
                        label={__('Stroke width', 'wpicons')}
                        value={stroke}
                        min={0.5}
                        max={3}
                        step={0.25}
                        onChange={setStroke}
                    />
                ) : null}
                <TextControl
                    label={__('Shortcode', 'wpicons')}
                    value={shortcode}
                    readOnly
                />
                <Button variant="primary" onClick={() => copyText(shortcode, 'shortcode')}>
                    {copied === 'shortcode' ? __('Copied', 'wpicons') : __('Copy shortcode', 'wpicons')}
                </Button>
                <p className="description">
                    {__('In the block editor, insert the Icon block and choose the same library and name.', 'wpicons')}
                </p>
            </aside>
        </div>
    );
}

const rootEl = document.getElementById('wpicons-library-root');
if (rootEl) {
    if (typeof createRoot === 'function') {
        createRoot(rootEl).render(<LibraryApp />);
    } else {
        render(<LibraryApp />, rootEl);
    }
}
