import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Button, Modal } from '@wordpress/components';
import IconPicker from '../picker/IconPicker';
import IconStyleControls from '../picker/IconStyleControls';
import { fetchLibraries } from '../picker/api';
import { pluginDefaults } from './placeholder';

export default function IconPickerModal({
    library,
    name,
    size,
    color,
    stroke,
    title,
    matchText = true,
    allowMatchText = true,
    onLibraryChange,
    onSelect,
    onClose,
    className = '',
}) {
    const defaults = pluginDefaults();
    const [supportsStroke, setSupportsStroke] = useState(library === 'lucide');
    const [style, setStyle] = useState(() => ({
        size: size === undefined || size === null || size === '' ? (defaults.size || 24) : Number(size),
        color: color || defaults.color || 'currentColor',
        stroke: stroke === undefined || stroke === null || stroke === '' ? (defaults.stroke ?? 2) : Number(stroke),
        title: title || '',
        matchText: allowMatchText ? Boolean(matchText) : false,
    }));

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

    const emit = (icon) => {
        const pixel = Number(style.size) > 0 ? Number(style.size) : (defaults.size || 24);
        const nextColor = !style.color || String(style.color).toLowerCase() === 'currentcolor'
            ? 'currentColor'
            : style.color;

        onSelect?.({
            library: icon?.library || library,
            name: icon?.name || name,
            svg: icon?.svg,
            size: allowMatchText && style.matchText ? '' : pixel,
            color: nextColor,
            stroke: Number(style.stroke) || defaults.stroke || 2,
            title: style.title || '',
            matchText: Boolean(allowMatchText && style.matchText),
        });
    };

    return (
        <Modal
            title={__('Choose icon', 'wpicons')}
            onRequestClose={onClose}
            className={`wpicons wpicons_ wpicons__picker-modal${className ? ` ${className}` : ''}`}
            theme="light"
            isFullScreen={false}
        >
            <div className="wpicons" theme="light">
                <IconPicker
                    library={library}
                    name={name}
                    onLibraryChange={onLibraryChange}
                    onSelect={emit}
                />
                <div className="wpicons__picker__style">
                    <IconStyleControls
                        size={style.size}
                        color={style.color}
                        stroke={style.stroke}
                        title={style.title}
                        supportsStroke={supportsStroke}
                        allowMatchText={allowMatchText}
                        matchText={style.matchText}
                        onChange={(patch) => setStyle((current) => ({ ...current, ...patch }))}
                    />
                    {name ? (
                        <Button variant="primary" onClick={() => emit(null)}>
                            {__('Update', 'wpicons')}
                        </Button>
                    ) : null}
                </div>
            </div>
        </Modal>
    );
}
