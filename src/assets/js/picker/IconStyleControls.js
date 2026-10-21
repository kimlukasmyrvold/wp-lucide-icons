import { RangeControl, TextControl, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

function themeColors() {
    const colors = window.WPIconsAdmin?.themeColors;
    return Array.isArray(colors) ? colors : [];
}

function ThemeColorSwatches({ value, onSelect }) {
    const colors = themeColors();
    if (!colors.length) {
        return null;
    }

    const current = String(value || '').trim().toLowerCase();

    return (
        <div className="wpicons__swatches" role="list">
            {colors.map((swatch) => {
                const selected = String(swatch.value || '').trim().toLowerCase() === current;

                return (
                    <button
                        key={swatch.id}
                        type="button"
                        role="listitem"
                        className={selected ? 'wpicons__swatch is-selected' : 'wpicons__swatch'}
                        title={swatch.label}
                        aria-label={swatch.label}
                        aria-pressed={selected}
                        style={{ background: swatch.preview }}
                        onClick={() => onSelect(swatch.value)}
                    />
                );
            })}
        </div>
    );
}

export default function IconStyleControls({
    size,
    color,
    stroke,
    title,
    supportsStroke = false,
    allowMatchText = false,
    matchText = false,
    onChange,
}) {
    const inherit = color == null || String(color).toLowerCase() === 'currentcolor';
    const pixelSize = Number(size) > 0 ? Number(size) : 24;

    return (
        <div className="wpicons__style">
            {allowMatchText ? (
                <ToggleControl
                    label={__('Match text size', 'wpicons')}
                    checked={Boolean(matchText)}
                    __nextHasNoMarginBottom
                    onChange={(checked) => onChange?.({ matchText: checked })}
                />
            ) : null}
            {!allowMatchText || !matchText ? (
                <RangeControl
                    label={__('Size', 'wpicons')}
                    value={pixelSize}
                    min={8}
                    max={256}
                    showTooltip={false}
                    __nextHasNoMarginBottom
                    onChange={(value) => {
                        if (typeof value !== 'number') {
                            return;
                        }
                        onChange?.({ size: value, matchText: false });
                    }}
                />
            ) : null}
            <ToggleControl
                label={__('Inherit text color', 'wpicons')}
                checked={inherit}
                __nextHasNoMarginBottom
                onChange={(checked) => {
                    const nextColor = checked ? 'currentColor' : '#000000';
                    onChange?.({ color: nextColor });
                }}
            />
            {!inherit ? (
                <div className="wpicons__style-color">
                    <TextControl
                        label={__('Color', 'wpicons')}
                        value={color || ''}
                        __nextHasNoMarginBottom
                        onChange={(value) => {
                            onChange?.({ color: value });
                        }}
                    />
                    <ThemeColorSwatches
                        value={color || ''}
                        onSelect={(next) => onChange?.({ color: next })}
                    />
                </div>
            ) : null}
            {supportsStroke ? (
                <RangeControl
                    label={__('Stroke width', 'wpicons')}
                    value={Number(stroke) || 2}
                    min={0.5}
                    max={3}
                    step={0.25}
                    showTooltip={false}
                    __nextHasNoMarginBottom
                    onChange={(value) => {
                        if (typeof value !== 'number') {
                            return;
                        }
                        onChange?.({ stroke: value });
                    }}
                />
            ) : null}
            <TextControl
                label={__('Accessible title', 'wpicons')}
                help={__('Leave empty for decorative icons (hidden from assistive tech).', 'wpicons')}
                value={title || ''}
                __nextHasNoMarginBottom
                onChange={(value) => onChange?.({ title: value })}
            />
        </div>
    );
}
