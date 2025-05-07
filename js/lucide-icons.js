'use strict';

function lucideIcons__fillIcons(dropdown) {
    const defaults = {
        size: 24,
        width: 2,
        color: 'currentColor',
    };

    const dropdownContent = dropdown.getElementById("wp_lucide_icons__content");
    if (!dropdownContent) {
        console.error('Could not find element: "#wp_lucide_icons__content"');
        return;
    }
    const container = dropdown.getElementById("wp_lucide_icons__icons");
    if (!container) {
        console.error('Could not find element: "#wp_lucide_icons__icons"')
        return;
    }

    const icons = Object.keys(lucide.icons).map(key => key.replaceAll(/(?<=\w)(?=[A-Z])/g, '-').toLowerCase()).sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0);

    if (!icons || icons.length < 1) {
        console.error("Error, something went wrong with getting lucide icons");
        return;
    }

    for (const icon of icons) {
        const box = document.createElement('div');
        box.className = 'wp_lucide_icons__dropdown__content__icons__box';
        box.dataset.icon_name = icon;

        const name = document.createElement('span');
        name.textContent = icon;

        const lucideIcon = document.createElement('i');
        lucideIcon.setAttribute('data-lucide', icon);
        lucideIcon.setAttribute('width', defaults.size);
        lucideIcon.setAttribute('height', defaults.size);

        box.addEventListener('click', () => {
            if (typeof editor === "undefined") {
                console.error("Editor is undefined");
                return;
            }

            editor.insertContent(`<span style="display:inline-grid">[lucide_icon name="${icon}" size="${defaults.size}" color="${defaults.color}" width="${defaults.width}"]</span> `);
            dropdownContent.dataset.lucide_icons_open = 'false';
        });
        box.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            navigator.clipboard.writeText(icon);
        });

        box.append(name, lucideIcon);
        container.append(box);
    }

    return container;
}

function lucideIcons__handleDropdown(html) {
    const container = document.getElementById("wp_lucide_icons");
    if (!container) {
        console.error('Could not find element: "#wp_lucide_icons"');
        return;
    }
    const parser = new DOMParser();
    const dropdown = parser.parseFromString(html, "text/html");

    const iconsContainer = lucideIcons__fillIcons(dropdown);
    if (!iconsContainer) {
        console.error('Error filling icons container');
        return;
    }

    dropdown.getElementById("wp_lucide_icons__icons").replaceWith(iconsContainer);

    const button = dropdown.querySelector(".wp_lucide_icons__dropdown__display__button");
    if (!button) {
        console.error("Could not find dropdown button");
        return;
    }
    const search = dropdown.getElementById("wp_lucide_icons__search_form");
    if (!search) {
        console.error("Could not find dropdown search");
        return;
    }
    const searchClear = dropdown.querySelector(".wp_lucide_icons__dropdown__content__search__input__clear");
    if (!searchClear) {
        console.error("Could not find dropdown clear search button");
        return;
    }
    const content = dropdown.getElementById("wp_lucide_icons__content");
    if (!content) {
        console.error("Could not find dropdown content");
        return;
    }

    const contentIcons = content.querySelectorAll('div[data-icon_name]');
    if (!contentIcons) {
        console.error("Could not find dropdown content icons");
        return;
    }



    const icons = Array.from(contentIcons);
    let fuse = null;
    if (typeof Fuse !== 'undefined') {
        fuse = new Fuse(icons.map(icon => ({
            element: icon,
            name: icon.getAttribute('data-icon_name'),
            tags: icon.getAttribute('data-icon_name').split('-'),
        })), {
            keys: ['name', 'tags'],
            threshold: 0.2,
        });
    }

    function filterIcons(searchQuery) {
        if (fuse === null) return;
        const results = fuse.search(searchQuery);
        const matchingElements = new Set(results.map(result => result.item.element));
        icons.forEach(icon => { icon.style.display = (searchQuery.length < 1 || matchingElements.has(icon)) ? 'initial' : 'none'; });
    }


    function open() { content.dataset.lucide_icons_open = 'true'; search.focus() }
    function close() { content.dataset.lucide_icons_open = 'false'; search.blur(); search.value = ''; filterIcons('') }
    function toggle() { content.dataset.lucide_icons_open === 'false' ? open() : close() }
    function handleClicks(e) {
        if (!button.contains(e.target) && !content.contains(e.target)) close();
        if (button.contains(e.target)) toggle();
    }


    window.addEventListener('click', handleClicks)
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape' || e.key === 'Esc') close() })
    button.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === 'Space') toggle() })
    search.addEventListener('click', (e) => { e.target.focus() })
    search.addEventListener('keyup', (e) => { filterIcons(e.target.value) })
    searchClear.addEventListener('click', () => { search.value = ''; filterIcons('') })


    container.append(...dropdown.body.childNodes);

    try {
        lucide.createIcons();
    } catch (error) {
        console.error("Could not create lucide icons:", error);
        return;
    }
}

function lucideIcons__createDropdown() {
    fetch(`${props.page_url}/wp-content/plugins/wp-lucide-icons/html/dropdown.html`)
        .then(response => response.text())
        .then(html => {
            try {
                lucideIcons__handleDropdown(html);
            } catch (error) {
                console.error("Error handling the dropdown:", error);
                return;
            }
        })
        .catch(error => {
            console.error('Error loading the HTML file:', error);
            return;
        });
}

function lucideIcons() {
    if (typeof lucide === 'undefined' || typeof tinymce === 'undefined') return;

    try {
        tinymce.create('tinymce.plugins.LucideIcons', {
            init: function (editor) {
                editor.addButton('lucideicons', {
                    type: 'button',
                    text: '',
                    icon: true,
                    tooltip: 'Insert Lucide Icon',
                    onPostRender: function () {
                        this.getEl().innerHTML = '<div class="wp_lucide_icons" id="wp_lucide_icons"></div>';
                        lucideIcons__createDropdown();
                    },
                });
            }
        });

        tinymce.PluginManager.add('lucideicons', tinymce.plugins.LucideIcons);
    } catch (error) {
        console.error("Failed to create Lucide dropdown:", error);
        return;
    }
}

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', lucideIcons);
}