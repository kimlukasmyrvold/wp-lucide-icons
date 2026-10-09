(function () {
    var title =
        window.wp && wp.i18n && typeof wp.i18n.__ === 'function'
            ? wp.i18n.__('Insert icon', 'wpicons')
            : 'Insert icon';

    function isInlineIcon(editor, node) {
        return node && node.nodeName === 'IMG' && editor.dom.hasClass(node, 'wpicons-inline');
    }

    function openPicker(editor, node) {
        if (!window.WPIcons || typeof window.WPIcons.openPicker !== 'function') {
            return;
        }

        window.WPIcons.openPicker({
            library: node ? editor.dom.getAttrib(node, 'data-library') : '',
            name: node ? editor.dom.getAttrib(node, 'data-name') : '',
            onSelect: function (html) {
                if (!html) {
                    return;
                }
                if (node && node.parentNode) {
                    editor.selection.select(node);
                }
                editor.insertContent(html);
            },
        });
    }

    tinymce.create('tinymce.plugins.WPIcons', {
        init: function (editor) {
            editor.addButton('wpicons', {
                title: title,
                tooltip: title,
                icon: 'dashicon dashicons-star-filled',
                onclick: function () {
                    var node = editor.selection.getNode();
                    openPicker(editor, isInlineIcon(editor, node) ? node : null);
                },
            });

            editor.addCommand('wpicons', function () {
                var node = editor.selection.getNode();
                openPicker(editor, isInlineIcon(editor, node) ? node : null);
            });

            editor.on('click', function (event) {
                if (isInlineIcon(editor, event.target)) {
                    openPicker(editor, event.target);
                }
            });
        },
    });

    tinymce.PluginManager.add('wpicons', tinymce.plugins.WPIcons);
})();
