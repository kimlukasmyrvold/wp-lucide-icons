import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { insertObject, registerFormatType } from '@wordpress/rich-text';
import { RichTextToolbarButton } from '@wordpress/block-editor';
import IconPickerModal from '../inline/IconPickerModal';
import { placeholderAttributes, pluginDefaults } from '../inline/placeholder';
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
        url: 'src',
        library: 'data-library',
        iconName: 'data-name',
        color: 'data-color',
        stroke: 'data-stroke',
        alt: 'alt',
    },
    edit: Edit,
});
