(function () {
    var TRANSPARENT_SRC =
        'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

    function svgUrl(node) {
        var dataSrc = node.getAttribute('data-src') || '';
        var src = node.getAttribute('src') || '';
        if (dataSrc.indexOf('data:image/svg+xml') === 0) {
            return dataSrc;
        }
        if (src.indexOf('data:image/svg+xml') === 0) {
            return src;
        }
        return '';
    }

    function maskSpan(node) {
        var src = node.getAttribute('data-src');
        if (!src) {
            return;
        }
        var current = node.style.getPropertyValue('--wpicons-src');
        if (current && current.indexOf(src) !== -1) {
            return;
        }
        node.style.setProperty('--wpicons-src', 'url("' + src.replace(/"/g, '') + '")');
    }

    function maskImage(node) {
        var src = svgUrl(node);
        if (!src) {
            return;
        }
        var current = node.style.getPropertyValue('--wpicons-src');
        var visible = node.getAttribute('src') || '';
        if (current && current.indexOf(src) !== -1 && visible === TRANSPARENT_SRC) {
            return;
        }
        node.setAttribute('data-src', src);
        node.style.setProperty('--wpicons-src', 'url("' + src.replace(/"/g, '') + '")');
        if (visible !== TRANSPARENT_SRC) {
            node.setAttribute('src', TRANSPARENT_SRC);
        }
    }

    function apply(root) {
        var scope = root && root.querySelectorAll ? root : document;
        var spans = scope.querySelectorAll('span.wpicons-inline[data-src]');
        var images = scope.querySelectorAll('img.wpicons-inline');
        var i;
        for (i = 0; i < spans.length; i++) {
            maskSpan(spans[i]);
        }
        for (i = 0; i < images.length; i++) {
            maskImage(images[i]);
        }
    }

    function boot() {
        apply(document);
        if (!window.MutationObserver || !document.documentElement) {
            return;
        }

        var scheduled = false;
        var observer = new MutationObserver(function () {
            if (scheduled) {
                return;
            }
            scheduled = true;
            window.requestAnimationFrame(function () {
                scheduled = false;
                apply(document);
            });
        });
        observer.observe(document.documentElement, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['src', 'data-src', 'class', 'style'],
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
