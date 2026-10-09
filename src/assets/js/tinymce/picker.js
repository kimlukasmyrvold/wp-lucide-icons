import { createRoot, render, unmountComponentAtNode, useState } from '@wordpress/element';
import IconPickerModal from '../inline/IconPickerModal';
import { placeholderHtml, pluginDefaults } from '../inline/placeholder';
import { fetchIcon } from '../picker/api';

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

function PickerApp({ initialLibrary, initialName, onSelect }) {
    const defaults = pluginDefaults();
    const [library, setLibrary] = useState(initialLibrary || defaults.library);

    const handleSelect = async (icon) => {
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

        closePicker();
        if (!svg) {
            return;
        }

        onSelect(
            placeholderHtml({
                library: icon.library,
                name: icon.name,
                svg,
                color: defaults.color || 'currentColor',
                stroke: defaults.stroke,
            }),
        );
    };

    return (
        <IconPickerModal
            library={library}
            name={initialName || ''}
            onLibraryChange={setLibrary}
            onSelect={handleSelect}
            onClose={closePicker}
        />
    );
}

window.WPIcons = window.WPIcons || {};
window.WPIcons.openPicker = function ({ onSelect, library, name } = {}) {
    mountPicker(
        <PickerApp
            initialLibrary={library}
            initialName={name}
            onSelect={typeof onSelect === 'function' ? onSelect : () => {}}
        />,
    );
};
