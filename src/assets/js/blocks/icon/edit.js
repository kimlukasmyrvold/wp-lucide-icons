import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
    InspectorControls,
    useBlockProps,
} from '@wordpress/block-editor';
import { Button, PanelBody } from '@wordpress/components';
import IconPickerModal from '../../inline/IconPickerModal';
import IconStyleControls from '../../picker/IconStyleControls';
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

    const blockProps = useBlockProps({
        className: 'wpicons wpicons_ wp-block-wpicons-icon__wrap',
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
            color: color || 'currentColor',
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
    }, [library, name, size, color, strokeWidth]);

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Icon', 'wpicons')} initialOpen>
                    <div className="wpicons wpicons_" theme="light">
                    <p>
                        <strong>{library}</strong> / {name}
                    </p>
                    <Button variant="secondary" onClick={() => setPickerOpen(true)}>
                        {__('Choose icon', 'wpicons')}
                    </Button>
                    <IconStyleControls
                        size={size || defaults.size}
                        color={color ?? defaults.color}
                        stroke={strokeWidth ?? defaults.stroke}
                        title={title || ''}
                        supportsStroke={supportsStroke}
                        onChange={(patch) => {
                            const next = {};
                            if (Object.prototype.hasOwnProperty.call(patch, 'size') && patch.size !== '') {
                                next.size = patch.size;
                            }
                            if (Object.prototype.hasOwnProperty.call(patch, 'color')) {
                                next.color = patch.color;
                                // #region agent log
                                fetch('http://127.0.0.1:7861/ingest/e51822a5-516d-4574-a743-ff8836d1dd47',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'22d134'},body:JSON.stringify({sessionId:'22d134',hypothesisId:'D',location:'edit.js:sidebar',message:'block color attribute',data:{from:color,to:patch.color},timestamp:Date.now()})}).catch(()=>{});
                                // #endregion
                            }
                            if (Object.prototype.hasOwnProperty.call(patch, 'stroke')) {
                                next.strokeWidth = patch.stroke;
                            }
                            if (Object.prototype.hasOwnProperty.call(patch, 'title')) {
                                next.title = patch.title;
                            }
                            if (Object.keys(next).length) {
                                setAttributes(next);
                            }
                        }}
                    />
                    </div>
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
                <IconPickerModal
                    library={library || defaults.library}
                    name={name}
                    size={size || defaults.size}
                    color={color ?? defaults.color}
                    stroke={strokeWidth ?? defaults.stroke}
                    title={title || ''}
                    allowMatchText={false}
                    matchText={false}
                    onLibraryChange={(nextLibrary) => setAttributes({ library: nextLibrary })}
                    onSelect={(icon) => {
                        setAttributes({
                            library: icon.library,
                            name: icon.name,
                            size: icon.size || defaults.size,
                            color: icon.color || defaults.color,
                            strokeWidth: icon.stroke ?? defaults.stroke,
                            title: icon.title || '',
                        });
                        setPickerOpen(false);
                    }}
                    onClose={() => setPickerOpen(false)}
                />
            ) : null}
        </>
    );
}
