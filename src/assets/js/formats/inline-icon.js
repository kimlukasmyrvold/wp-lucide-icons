import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { dispatch, select, subscribe } from '@wordpress/data';
import { insertObject, registerFormatType } from '@wordpress/rich-text';
import { RichTextToolbarButton } from '@wordpress/block-editor';
import IconPickerModal from '../inline/IconPickerModal';
import { migrateInlineIconHtml, placeholderAttributes, pluginDefaults } from '../inline/placeholder';
import { fetchIcon } from '../picker/api';

export const FORMAT_NAME = 'wpicons/inline-icon';

function Edit({ value, onChange, onFocus, isObjectActive, activeObjectAttributes }) {
    const defaults = pluginDefaults();
    const [pickerOpen, setPickerOpen] = useState(false);
    const [library, setLibrary] = useState(defaults.library);

    const openPicker = () => {
        setLibrary(activeObjectAttributes?.library || defaults.library);
        setPickerOpen(true);
    };

    const applyIcon = async (icon) => {
        let svg = icon.svg;
        if (!svg) {
            try {
                const data = await fetchIcon({
                    library: icon.library,
                    name: icon.name,
                    size: 24,
                    color: defaults.color || 'currentColor',
                    stroke: defaults.stroke,
                });
                svg = data.svg || '';
            } catch (error) {
                svg = '';
            }
        }

        if (!svg) {
            setPickerOpen(false);
            return;
        }

        onChange(
            insertObject(value, {
                type: FORMAT_NAME,
                attributes: placeholderAttributes({
                    library: icon.library,
                    name: icon.name,
                    svg,
                    color: defaults.color || 'currentColor',
                    stroke: defaults.stroke,
                }),
            }),
        );
        onFocus?.();
        setPickerOpen(false);
    };

    return (
        <>
            <RichTextToolbarButton
                icon="star-filled"
                title={__('Insert icon', 'wpicons')}
                onClick={openPicker}
                isActive={isObjectActive}
            />
            {pickerOpen ? (
                <IconPickerModal
                    library={library}
                    name={activeObjectAttributes?.iconName || ''}
                    onLibraryChange={setLibrary}
                    onSelect={applyIcon}
                    onClose={() => setPickerOpen(false)}
                />
            ) : null}
        </>
    );
}

registerFormatType(FORMAT_NAME, {
    title: __('Icon', 'wpicons'),
    tagName: 'img',
    className: 'wpicons-inline',
    object: true,
    attributes: {
        url: 'data-src',
        src: 'src',
        alt: 'alt',
        iconStyle: 'style',
        library: 'data-library',
        iconName: 'data-name',
        color: 'data-color',
        stroke: 'data-stroke',
    },
    edit: Edit,
});

function migrateBlockTree(blocks) {
    blocks.forEach((block) => {
        const updates = {};
        Object.entries(block.attributes || {}).forEach(([key, value]) => {
            if (typeof value !== 'string' || !value.includes('wpicons-inline') || !value.includes('<span')) {
                return;
            }
            const next = migrateInlineIconHtml(value);
            if (next !== value) {
                updates[key] = next;
            }
        });
        if (Object.keys(updates).length > 0) {
            dispatch('core/block-editor').updateBlockAttributes(block.clientId, updates);
        }
        if (block.innerBlocks && block.innerBlocks.length) {
            migrateBlockTree(block.innerBlocks);
        }
    });
}

function watchForLegacyIcons() {
    if (typeof subscribe !== 'function' || !select('core/block-editor')) {
        return;
    }

    let started = false;
    const unsubscribe = subscribe(() => {
        if (started) {
            return;
        }
        const editorSelect = select('core/editor');
        if (editorSelect && typeof editorSelect.__unstableIsEditorReady === 'function') {
            if (!editorSelect.__unstableIsEditorReady()) {
                return;
            }
        } else if (!select('core/block-editor').getBlocks().length) {
            return;
        }

        started = true;
        unsubscribe();
        window.setTimeout(() => {
            const blocks = select('core/block-editor').getBlocks();
            if (blocks.length) {
                migrateBlockTree(blocks);
            }
        }, 0);
    });
}

watchForLegacyIcons();
