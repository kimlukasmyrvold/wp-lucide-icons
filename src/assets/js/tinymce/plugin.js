(function () {
    var title =
        window.wp && wp.i18n && typeof wp.i18n.__ === 'function'
            ? wp.i18n.__('Insert icon', 'wpicons')
            : 'Insert icon';

    function readAttr(tag, name) {
        var match = tag.match(new RegExp('\\s' + name + '\\s*=\\s*("|\\\')([\\s\\S]*?)\\1', 'i'));
        return match ? match[2] : '';
    }

    function escapeAttr(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    function optionalAttr(name, value) {
        if (!value) {
            return '';
        }
        return ' ' + name + '="' + escapeAttr(value) + '"';
    }

    function previewStyle(src, color, size) {
        var style = '--wpicons-src:url(&quot;' + src + '&quot;)';
        if (color && color.toLowerCase() !== 'currentcolor') {
            style += ';background-color:' + String(color).replace(/[;"\\]/g, '');
        }
        if (size && /^\d+$/.test(String(size))) {
            style += ';width:' + size + 'px;height:' + size + 'px';
        }
        return style;
    }

    function iconSrc(tag) {
        var src = readAttr(tag, 'data-src') || readAttr(tag, 'src');
        if (src && src.indexOf('data:image/svg+xml') === 0) {
            return src;
        }

        var style = readAttr(tag, 'style');
        var match = style.match(/url\((?:&quot;|"|')?(data:image\/svg\+xml[^"')]+)/i);
        return match ? match[1] : src;
    }

    function spanToImg(html) {
        if (!html || html.indexOf('wpicons-inline') === -1 || html.indexOf('<span') === -1) {
            return html;
        }

        return html.replace(/<span\b(?=[^>]*\bwpicons-inline\b)[^>]*>\s*<\/span>/gi, function (tag) {
            var src = iconSrc(tag);
            var name = readAttr(tag, 'data-name');
            if (!src || !name) {
                return tag;
            }

            var library = readAttr(tag, 'data-library') || 'lucide';
            var color = readAttr(tag, 'data-color') || 'currentColor';
            var stroke = readAttr(tag, 'data-stroke') || '2';
            var size = readAttr(tag, 'data-size');
            var iconTitle = readAttr(tag, 'data-title');

            var sizeStyle = size && /^\d+$/.test(String(size))
                ? ' style="width:' + size + 'px;height:' + size + 'px"'
                : '';

            return (
                '<img class="wpicons-inline"' +
                ' src="' + escapeAttr(src) + '"' +
                ' data-src="' + escapeAttr(src) + '"' +
                sizeStyle +
                ' data-library="' + escapeAttr(library) + '"' +
                ' data-name="' + escapeAttr(name) + '"' +
                ' data-color="' + escapeAttr(color) + '"' +
                ' data-stroke="' + escapeAttr(stroke) + '"' +
                optionalAttr('data-size', size) +
                optionalAttr('data-title', iconTitle) +
                ' alt="' + escapeAttr(iconTitle) + '" />'
            );
        });
    }

    function imgToSpan(html) {
        if (!html || html.indexOf('wpicons-inline') === -1 || html.indexOf('<img') === -1) {
            return html;
        }

        return html.replace(/<img\b(?=[^>]*\bwpicons-inline\b)[^>]*>/gi, function (tag) {
            var src = iconSrc(tag);
            var name = readAttr(tag, 'data-name');
            if (!src || !name) {
                return tag;
            }

            var library = readAttr(tag, 'data-library') || 'lucide';
            var color = readAttr(tag, 'data-color') || 'currentColor';
            var stroke = readAttr(tag, 'data-stroke') || '2';
            var size = readAttr(tag, 'data-size');
            var iconTitle = readAttr(tag, 'data-title');

            return (
                '<span class="wpicons-inline"' +
                ' data-src="' + src + '"' +
                ' style="' + previewStyle(src, color, size) + '"' +
                ' data-library="' + escapeAttr(library) + '"' +
                ' data-name="' + escapeAttr(name) + '"' +
                ' data-color="' + escapeAttr(color) + '"' +
                ' data-stroke="' + escapeAttr(stroke) + '"' +
                optionalAttr('data-size', size) +
                optionalAttr('data-title', iconTitle) +
                '></span>'
            );
        });
    }

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
            color: node ? editor.dom.getAttrib(node, 'data-color') : '',
            stroke: node ? editor.dom.getAttrib(node, 'data-stroke') : '',
            size: node ? editor.dom.getAttrib(node, 'data-size') : '',
            title: node ? editor.dom.getAttrib(node, 'data-title') : '',
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

            editor.on('BeforeSetContent', function (event) {
                if (event.content) {
                    event.content = spanToImg(event.content);
                }
            });

            editor.on('GetContent', function (event) {
                if (event.content) {
                    event.content = imgToSpan(event.content);
                }
            });
        },
    });

    tinymce.PluginManager.add('wpicons', tinymce.plugins.WPIcons);
})();
