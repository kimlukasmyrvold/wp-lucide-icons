import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
    InspectorControls,
    useBlockProps,
} from '@wordpress/block-editor';
import {
    Button,
    Modal,
    PanelBody,
    RangeControl,
    TextControl,
    ToggleControl,
} from '@wordpress/components';
import IconPicker from '../../picker/IconPicker';
import { fetchIcon, fetchLibraries } from '../../picker/api';

const defaults = window.WPIconsAdmin?.defaults || {
    library: 'lucide',
    size: 24,
    color: 'currentColor',
    stroke: 2,
};

export default function Edit({ attributes, setAttributes }) {
    const { library, name, size, color, strokeWidth, title } = attributes;
    const [pickerOpen, setPickerOpen] = useState(false);
    const [preview, setPreview] = useState('');
    const [supportsStroke, setSupportsStroke] = useState(library === 'lucide');
    const [useCurrentColor, setUseCurrentColor] = useState(
        !color || color === 'currentColor',
    );

    const blockProps = useBlockProps({
        className: 'wpicons wp-block-wpicons-icon__wrap',
    });

    useEffect(() => {
        let cancelled = false;
        fetchLibraries()
            .then((data) => {
                if (cancelled) {
                    return;
                }
                const current = (data.libraries || []).find((item) => item.id === library);
                setSupportsStroke(Boolean(current?.supports?.includes('stroke')));
            })
            .catch(() => {});

        return () => {
            cancelled = true;
        };
    }, [library]);

    useEffect(() => {
        let cancelled = false;
        fetchIcon({
            library,
            name,
            size,
            color: useCurrentColor ? 'currentColor' : color,
            stroke: strokeWidth,
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
    }, [library, name, size, color, strokeWidth, useCurrentColor]);

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Icon', 'wpicons')} initialOpen>
                    <p>
                        <strong>{library}</strong> / {name}
                    </p>
                    <Button variant="secondary" onClick={() => setPickerOpen(true)}>
                        {__('Choose icon', 'wpicons')}
                    </Button>
                    <RangeControl
                        label={__('Size', 'wpicons')}
                        value={size || defaults.size}
                        min={8}
                        max={256}
                        onChange={(value) => setAttributes({ size: value })}
                    />
                    <ToggleControl
                        label={__('Inherit text color', 'wpicons')}
                        checked={useCurrentColor}
                        onChange={(checked) => {
                            setUseCurrentColor(checked);
                            setAttributes({ color: checked ? 'currentColor' : '#000000' });
                        }}
                    />
                    {!useCurrentColor ? (
                        <TextControl
                            label={__('Color', 'wpicons')}
                            value={color}
                            onChange={(value) => setAttributes({ color: value })}
                        />
                    ) : null}
                    {supportsStroke ? (
                        <RangeControl
                            label={__('Stroke width', 'wpicons')}
                            value={strokeWidth || defaults.stroke}
                            min={0.5}
                            max={3}
                            step={0.25}
                            onChange={(value) => setAttributes({ strokeWidth: value })}
                        />
                    ) : null}
                    <TextControl
                        label={__('Accessible title', 'wpicons')}
                        help={__('Leave empty for decorative icons (hidden from assistive tech).', 'wpicons')}
                        value={title || ''}
                        onChange={(value) => setAttributes({ title: value })}
                    />
                </PanelBody>
            </InspectorControls>
            <div {...blockProps}>
                {preview ? (
                    <span dangerouslySetInnerHTML={{ __html: preview }} />
                ) : (
                    <Button variant="primary" onClick={() => setPickerOpen(true)}>
                        {__('Choose icon', 'wpicons')}
                    </Button>
                )}
            </div>
            {pickerOpen ? (
                <Modal
                    title={__('Choose icon', 'wpicons')}
                    onRequestClose={() => setPickerOpen(false)}
                    className="wpicons wpicons__picker-modal"
                    isFullScreen={false}
                >
                    <IconPicker
                        library={library || defaults.library}
                        name={name}
                        onLibraryChange={(nextLibrary) => setAttributes({ library: nextLibrary })}
                        onSelect={(icon) => {
                            setAttributes({
                                library: icon.library,
                                name: icon.name,
                            });
                            setPickerOpen(false);
                        }}
                    />
                </Modal>
            ) : null}
        </>
    );
}
