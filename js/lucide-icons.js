(function () {
    if (typeof lucide === 'undefined' || typeof wpLucideIcons === 'undefined') return;
    
    function addDrinkToText(icon_name, size, color, stroke_width) {
        editor.insertContent(`<span style="display:inline-grid">[lucide_icon name="${icon_name}" size="${size}" color="${color}" width="${stroke_width}"]</span> `)
        document.querySelector('#wp_lucide_icons .wp_lucide_icons__dropdown__content').dataset.lucide_icons_open = 'false'
    }

    function loadHTML(id, filename) {
        if (!filename) return;
        const element = document.querySelector(id);
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4) {
                if (this.status == 200) {
                    element.innerHTML = this.responseText;
                    createIconsFromList(element.querySelector('.wp_lucide_icons__dropdown__content__icons'));
                    lucide.createIcons()
                    element.querySelectorAll('svg rect').forEach(rect => { // add inline style tag to the recs so it doesn't get overiden by bad css from tinymce
                        rect.setAttribute('style', `width:${rect.getAttribute('width')}px; height:${rect.getAttribute('height')}px;`)
                    })

                    const button = element.querySelector('.wp_lucide_icons__dropdown__display__button')
                    const content = element.querySelector('.wp_lucide_icons__dropdown__content')
                    const search = element.querySelector('#wp_lucide_icons__search_form')
                    const clear = element.querySelector('.wp_lucide_icons__dropdown__content__search__input__clear')

                    button.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === 'Space') toggle() })
                    search.addEventListener('click', (e) => { e.target.focus() })
                    clear.addEventListener('click', () => { search.value = ''; filterIcons('') })
                    window.addEventListener('click', handleDropClicks)
                    window.addEventListener('keydown', handleKeydown)

                    function close() { content.dataset.lucide_icons_open = 'false'; search.blur() }
                    function open() { content.dataset.lucide_icons_open = 'true'; search.focus() }
                    function toggle() { content.dataset.lucide_icons_open === 'false' ? open() : close() }

                    function handleKeydown(e) { if (e.key === 'Escape' || e.key === 'Esc') close() }
                    function handleDropClicks(e) {
                        if (!button.contains(e.target) && !content.contains(e.target)) close()
                        if (button.contains(e.target)) toggle()
                    }

                    // search icons
                    const icons = Array.from(element.querySelectorAll('.wp_lucide_icons__dropdown__content div[data-icon_name]'))
                    const iconData = icons.map(icon => ({
                        element: icon,
                        name: icon.getAttribute('data-icon_name'),
                        tags: icon.getAttribute('data-icon_name').split('-'),
                    }))
                    const fuse = new Fuse(iconData, {
                        keys: ['name', 'tags'],
                        threshold: 0.2,
                    })

                    function filterIcons(searchQuery) {
                        const results = fuse.search(searchQuery)
                        const matchingElements = new Set(results.map(result => result.item.element))
                        icons.forEach(icon => {
                            if (searchQuery.length < 1 || matchingElements.has(icon)) icon.style.display = 'initial'
                            else icon.style.display = 'none'
                        })
                    }

                    search.addEventListener('keyup', (e) => {
                        filterIcons(e.target.value);
                    })
                } else if (this.status == 404) { element.innerHTML = '' }
            };
        };
        xhttp.open("GET", `${wpLucideIcons.ajaxUrl}${filename}`, true);
        xhttp.send();
        return;
    }

    function createIconsFromList(iconsContainer) {
        const allIcons = Object.fromEntries(Object.entries(lucide.icons).sort((a, b) => {
            if (a[0] < b[0]) return -1
            if (a[0] > b[0]) return 1
            return 0
        }))

        for (const icon in allIcons) {
            const clean_icon = icon.replaceAll(/(?<=\w)(?=[A-Z])/g, '-').toLowerCase()

            const box = document.createElement('div')
            box.className = 'wp_lucide_icons__dropdown__content__icons__box'
            box.dataset.icon_name = clean_icon

            const name = document.createElement('span')
            name.textContent = clean_icon

            const lucideIcon = document.createElement('i')
            lucideIcon.setAttribute('data-lucide', clean_icon)
            lucideIcon.setAttribute('width', '24')
            lucideIcon.setAttribute('height', '24')

            box.addEventListener('click', () => { addDrinkToText(clean_icon, '24', 'currentColor', '2') })
            box.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                navigator.clipboard.writeText(clean_icon);
            });
            box.append(name, lucideIcon)

            iconsContainer.append(box);
        }
    }

    if (typeof tinymce === 'undefined') return;
    tinymce.create('tinymce.plugins.LucideIcons', {
        init: function (editor) {
            editor.addButton('lucideicons', {
                type: 'button',
                text: '',
                icon: true,
                tooltip: 'Insert Lucide Icon',
                onPostRender: function () {
                    const div = this.getEl();
                    div.innerHTML = '<div class="wp_lucide_icons" id="wp_lucide_icons"></div>';
                    loadHTML('#wp_lucide_icons', 'dropdown.html')
                },
            });
        }
    });

    tinymce.PluginManager.add('lucideicons', tinymce.plugins.LucideIcons);
})();