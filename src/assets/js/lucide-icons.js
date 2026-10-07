'use strict';
if (typeof window === 'undefined' || typeof document === 'undefined') throw new Error('This script must be run in a browser environment.');

(async () => {
    function lucideIcons__renderDropdownTemplate() {
        if (typeof wpLucideIcons === 'undefined' || !wpLucideIcons.html) {
            console.error('Dropdown template is not available');
            return '';
        }

        return wpLucideIcons.html;
    }


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



        const dropdownButton = `
        <div class="wp_lucide_icons__dropdown">
            <div class="wp_lucide_icons__dropdown__display">
                <button class="wp_lucide_icons__dropdown__display__button">
                    <span class="screen-reader-text">Add Lucide Icon</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        class="lucide lucide-images">
                        <path d="M18 22H4a2 2 0 0 1-2-2V6" />
                        <path d="m22 13-1.296-1.296a2.41 2.41 0 0 0-3.408 0L11 18" />
                        <circle cx="12" cy="8" r="2" />
                        <rect width="16" height="16" x="6" y="2" rx="2" />
                    </svg>
                </button>
            </div>
        </div>
    `;
        container.innerHTML = dropdownButton;

        // container.append(...dropdown.body.childNodes);

        // try {
        //     lucide.createIcons();
        // } catch (error) {
        //     console.error("Could not create lucide icons:", error);
        //     return;
        // }


        console.log(container, dropdown);

        const parent = document.querySelector('body');
        console.log(parent);
        parent.append(...dropdown.body.childNodes);
    }

    function lucideIcons__createDropdown() {
        const html = lucideIcons__renderDropdownTemplate();
        if (!html) {
            return;
        }

        lucideIcons__handleDropdown(html);
    }

    async function lucideIcons__toggleDropdown(state = 'toggle') {
        const validStates = ['toggle', 'close', 'open'];
        if (!validStates.includes(state)) return;

        console.log({ state });
    }

    async function lucideIcons() {
        if (typeof lucide === 'undefined' || typeof tinymce === 'undefined') return;

        try {
            const lucideButtonIcon = (() => {
                const xmlns = "http://www.w3.org/2000/svg";

                const icon = document.createElementNS(xmlns, 'svg');
                icon.setAttributeNS(null, 'viewBox', '0 0 24 24');
                icon.setAttributeNS(null, 'width', 20);
                icon.setAttributeNS(null, 'height', 20);
                icon.setAttributeNS(null, 'fill', 'none');
                icon.setAttributeNS(null, 'stroke', 'currentColor');
                icon.setAttributeNS(null, 'stroke-width', 2);
                icon.setAttributeNS(null, 'stroke-linecap', 'round');
                icon.setAttributeNS(null, 'stroke-linejoin', 'round');
                icon.setAttributeNS(null, 'class', 'mce-ico lucide lucide-images');

                const path1 = document.createElementNS(xmlns, 'path');
                path1.setAttributeNS(null, 'd', "M18 22H4a2 2 0 0 1-2-2V6");

                const path2 = document.createElementNS(xmlns, 'path');
                path2.setAttributeNS(null, 'd', "m22 13-1.296-1.296a2.41 2.41 0 0 0-3.408 0L11 18");

                const circle = document.createElementNS(xmlns, 'circle');
                circle.setAttributeNS(null, 'cx', 12);
                circle.setAttributeNS(null, 'cy', 8);
                circle.setAttributeNS(null, 'r', 2);

                const rect = document.createElementNS(xmlns, 'rect');
                rect.setAttributeNS(null, 'width', 16);
                rect.setAttributeNS(null, 'height', 16);
                rect.setAttributeNS(null, 'x', 6);
                rect.setAttributeNS(null, 'y', 2);
                rect.setAttributeNS(null, 'rx', 2);

                icon.append(path1, path2, circle, rect);
                return icon;
            })();

            tinymce.create('tinymce.plugins.LucideIcons', {
                init: function (editor) {
                    editor.addButton('lucideicons', {
                        type: 'button',
                        text: '',
                        icon: true,
                        tooltip: 'Insert Lucide Icon',
                        onPostRender: function () {
                            const button = this.getEl().querySelector('button');
                            button.querySelector('i.mce-ico').remove();
                            button.append(lucideButtonIcon);
                            button.classList.add('wp_lucide_icons__button');
                            button.addEventListener('click', lucideIcons__toggleDropdown);

                            // lucideIcons__createDropdown();

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

    document.addEventListener('DOMContentLoaded', lucideIcons);
})();
