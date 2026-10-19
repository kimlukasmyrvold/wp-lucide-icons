import { createRoot, render, unmountComponentAtNode, useState } from '@wordpress/element';
import IconPickerModal from '../inline/IconPickerModal';
import { placeholderHtml, pluginDefaults, resolveMaskSvg } from '../inline/placeholder';

let rootEl = null;
let root = null;

function closePicker() {
    if (root) {
        root.render(null);
        return;
    }

    if (rootEl && typeof unmountComponentAtNode === 'function') {
        unmountComponentAtNode(rootEl);
    }
}

function mountPicker(app) {
    if (!rootEl) {
        rootEl = document.createElement('div');
        rootEl.id = 'wpicons-tinymce-picker-root';
        document.body.appendChild(rootEl);
    }

    if (typeof createRoot === 'function') {
        if (!root) {
            root = createRoot(rootEl);
        }
        root.render(app);
        return;
    }

    render(app, rootEl);
}

function PickerApp({
    initialLibrary,
    initialName,
    initialColor,
    initialStroke,
    initialSize,
    initialTitle,
    onSelect,
}) {
    const defaults = pluginDefaults();
    const [library, setLibrary] = useState(initialLibrary || defaults.library);
    const hasIcon = Boolean(initialName);

    const handleSelect = async (icon) => {
        const svg = await resolveMaskSvg({
            library: icon.library,
            name: icon.name,
            svg: icon.svg,
            stroke: icon.stroke,
        });
        closePicker();
        if (!svg) {
            return;
        }

        onSelect(placeholderHtml({
            library: icon.library,
            name: icon.name,
            svg,
            color: icon.color,
            stroke: icon.stroke,
            size: icon.size,
            title: icon.title,
        }));
    };

    return (
        <IconPickerModal
            library={library}
            name={initialName || ''}
            size={hasIcon ? initialSize : (defaults.size || 24)}
            color={initialColor || defaults.color || 'currentColor'}
            stroke={initialStroke === undefined || initialStroke === null || initialStroke === ''
                ? defaults.stroke
                : initialStroke}
            title={initialTitle || ''}
            matchText={hasIcon ? !initialSize : true}
            allowMatchText
            onLibraryChange={setLibrary}
            onSelect={handleSelect}
            onClose={closePicker}
            className="wpicons__picker-modal--tinymce"
        />
    );
}

window.WPIcons = window.WPIcons || {};
window.WPIcons.openPicker = function ({
    onSelect,
    library,
    name,
    color,
    stroke,
    size,
    title,
} = {}) {
    mountPicker(
        <PickerApp
            initialLibrary={library}
            initialName={name}
            initialColor={color}
            initialStroke={stroke}
            initialSize={size}
            initialTitle={title}
            onSelect={typeof onSelect === 'function' ? onSelect : () => {}}
        />,
    );
};
