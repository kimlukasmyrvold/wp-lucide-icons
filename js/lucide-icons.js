(function () {
    console.log('lucide-icons.js loaded');

    function loadHTML(id, filename) {
        if (!filename) return;
        const element = document.querySelector(id);
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4) {
                if (this.status == 200) {
                    element.innerHTML = this.responseText;
                    lucide.createIcons()
                    createIcons(element.querySelector('.wp_lucide_icons__dropdown__content__icons'));
                    element.querySelectorAll('svg rect').forEach(rect => { // add inline style tag to the recs so it doesn't get overiden by bad css from tinymce
                        rect.setAttribute('style', `width:${rect.getAttribute('width')}px; height:${rect.getAttribute('height')}px;`)
                    })

                    const button = element.querySelector('.wp_lucide_icons__dropdown__display__button')
                    const content = element.querySelector('.wp_lucide_icons__dropdown__content')
                    window.addEventListener('click', handleDropClicks)
                    window.addEventListener('keydown', handleKeydown)

                    function close() { content.dataset.lucide_icons_open = 'false' }
                    function open() { content.dataset.lucide_icons_open = 'true' }
                    function toggle() { content.dataset.lucide_icons_open === 'false' ? open() : close() }

                    function handleKeydown(e) { if (e.key === 'Escape' || e.key === 'Esc') close() }
                    function handleDropClicks(e) {
                        if (!button.contains(e.target) && !content.contains(e.target)) close()
                        if (button.contains(e.target)) toggle()
                    }
                } else if (this.status == 404) { element.innerHTML = '' }
            };
        };
        xhttp.open("GET", `/wp-content/plugins/wp-lucide-icons/html/${filename}`, true);
        xhttp.send();
        return;
    }

    function createIcons(iconsContainer) {
        const allIcons = lucide.icons

        for (const icon in allIcons) {
            const box = document.createElement('div')
            box.className = 'wp_lucide_icons__dropdown__content__icons__box'
            const name = document.createElement('span')
            name.textContent = icon

            box.append(name, lucide.createElement(allIcons[icon]))
            iconsContainer.append(box);
        }
    }

    if (typeof tinymce === 'undefined') return;
    tinymce.create('tinymce.plugins.LucideIcons', {
        init: function (editor) {
            editor.addButton('lucideicons', {
                type: 'button',
                text: '',
                icon: false,
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



// (function () {
//     const lucideIcons = [
//         { name: "calendar", svg: "<svg data-lucide='calendar' width='24' height='24' stroke='currentColor' fill='none' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M3 4h18M3 10h18M8 4v2M16 4v2m-5 4v6m-2-6v6m6-6v6m2-6v6'/></svg>" },
//         { name: "bell", svg: "<svg data-lucide='bell' width='24' height='24' stroke='currentColor' fill='none' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M18 8a6 6 0 0 0-12 0c0 5.25-3 8-3 8h18s-3-2.75-3-8'/><path d='M13.73 21a2 2 0 0 1-3.46 0'/></svg>" },
//         { name: "edit", svg: "<svg data-lucide='edit' width='24' height='24' stroke='currentColor' fill='none' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M12 20h9'/><path d='M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z'/></svg>" }
//         // Add more Lucide icons here...
//     ];

//     tinymce.PluginManager.add('lucideicons', function (editor) {
//         editor.ui.registry.addMenuButton('lucideicons', {
//             text: 'Icons',
//             tooltip: 'Insert an icon',
//             fetch: function (callback) {
//                 callback([
//                     {
//                         type: 'menuitem',
//                         text: 'Insert Icon',
//                         onAction: function () {
//                             // Open a modal with search bar and grid of icons
//                             editor.windowManager.open({
//                                 title: 'Insert Lucide Icon',
//                                 body: {
//                                     type: 'panel',
//                                     items: [
//                                         {
//                                             type: 'input',
//                                             name: 'search',
//                                             label: 'Search Icons',
//                                             placeholder: 'Type to search...',
//                                             onInput: function (api, details) {
//                                                 const query = details.value.toLowerCase();
//                                                 const filteredIcons = lucideIcons.filter(icon =>
//                                                     icon.name.includes(query)
//                                                 );
//                                                 api.setData({ icons: filteredIcons });
//                                             }
//                                         },
//                                         {
//                                             type: 'htmlpanel',
//                                             html: renderIconGrid(lucideIcons)
//                                         }
//                                     ]
//                                 },
//                                 buttons: [
//                                     {
//                                         type: 'cancel',
//                                         text: 'Close'
//                                     }
//                                 ],
//                                 onSubmit: function (api) {
//                                     const selectedIcon = api.getData().selectedIcon;
//                                     if (selectedIcon) {
//                                         editor.insertContent(selectedIcon.svg);
//                                     }
//                                     api.close();
//                                 }
//                             });
//                         }
//                     }
//                 ]);
//             }
//         });

//         function renderIconGrid(icons) {
//             return `
//                 <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px;">
//                     ${icons.map(icon => `
//                         <div style="cursor: pointer;" data-icon="${icon.name}" title="${icon.name}" onclick="selectIcon('${icon.name}')">
//                             ${icon.svg}
//                         </div>
//                     `).join('')}
//                 </div>
//             `;
//         }

//         window.selectIcon = function (iconName) {
//             // Logic to handle icon selection
//             const selectedIcon = lucideIcons.find(icon => icon.name === iconName);
//             if (selectedIcon) {
//                 editor.insertContent(selectedIcon.svg);
//             }
//         };
//     });
// })();





// (function () {
//     console.log('lucide-icons.js loaded');

//     function loadHTML(id, filename, callback) {
//         let xhttp;
//         let element = document.querySelector(id);
//         let file = filename;

//         if (file) {
//             xhttp = new XMLHttpRequest();
//             xhttp.onreadystatechange = function () {
//                 if (this.readyState == 4) {
//                     if (this.status == 200) {
//                         element.innerHTML = this.responseText;
//                         if (typeof callback === 'function') { callback(); };
//                         addIcons();
//                     } else if (this.status == 404) { element.innerHTML = '<h1 id="error">Error 404; Page not found.</h1>'; };
//                 };
//             };
//             xhttp.open("GET", `html/${file}`, true);
//             xhttp.send();
//             return;
//         };
//     }

//     tinymce.create('tinymce.plugins.LucideIcons', {
//         init: function (editor, url) {
//             editor.addButton('lucideicons', {
//                 type: 'menubutton',
//                 text: '',
//                 icon: false,
//                 tooltip: 'Insert Lucide Icon',
//                 onPostRender: function () {
//                     const button = this.getEl();
//                     button.innerHTML = `
//                         <button>
//                             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-images"><path d="M18 22H4a2 2 0 0 1-2-2V6"></path><path d="m22 13-1.296-1.296a2.41 2.41 0 0 0-3.408 0L11 18"></path><circle cx="12" cy="8" r="2"></circle><rect style="width:16px;height:16px;" width="16" height="16" x="6" y="2" rx="2"></rect></svg>
//                         </button>
//                     `;
//                 },
//                 menu: [
//                     {
//                         text: 'Calendar Icon',
//                         onclick: function () {
//                             editor.insertContent('<svg data-lucide="calendar" width="24" height="24" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h18M3 10h18M8 4v2M16 4v2m-5 4v6m-2-6v6m6-6v6m2-6v6"/></svg>');
//                         }
//                     },
//                     {
//                         text: 'Bell Icon',
//                         onclick: function () {
//                             editor.insertContent('<svg data-lucide="bell" width="24" height="24" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 5.25-3 8-3 8h18s-3-2.75-3-8"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>');
//                         }
//                     },
//                     {
//                         text: 'Edit Icon',
//                         onclick: function () {
//                             editor.insertContent('<svg data-lucide="edit" width="24" height="24" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>');
//                         }
//                     }
//                 ]
//             });
//         }
//     });

//     tinymce.PluginManager.add('lucideicons', tinymce.plugins.LucideIcons);
// })();