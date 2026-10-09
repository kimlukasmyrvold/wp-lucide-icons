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

function LibraryApp() {
    const [library, setLibrary] = useState(pluginDefaults.library);
    const [name, setName] = useState('circle');
    const [size, setSize] = useState(pluginDefaults.size);
    const [color, setColor] = useState(pluginDefaults.color);
    const [stroke, setStroke] = useState(pluginDefaults.stroke);
    const [useCurrentColor, setUseCurrentColor] = useState(true);
    const [supportsStroke, setSupportsStroke] = useState(true);
    const [preview, setPreview] = useState('');
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

    useEffect(() => {
        fetchLibraries()
            .then((data) => {
                const current = (data.libraries || []).find((item) => item.id === library);
                setSupportsStroke(Boolean(current?.supports?.includes('stroke')));
            })
            .catch(() => {});
    }, [library]);

    useEffect(() => {
        let cancelled = false;
        fetchIcon({
            library,
            name,
            size,
            color: useCurrentColor ? 'currentColor' : color,
            stroke,
        })
            .then((data) => {
                if (!cancelled) {
                    setPreview(data.svg || '');
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setPreview('');
                }
            });

        return () => {
            cancelled = true;
        };
    }, [library, name, size, color, stroke, useCurrentColor]);

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
                    onLibraryChange={setLibrary}
                    onSelect={(icon) => {
                        setLibrary(icon.library);
                        setName(icon.name);
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
