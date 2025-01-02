(function () {
    console.log('calllelleldlled');

    tinymce.create('tinymce.plugins.LucideIcons', {
        init: function (editor, url) {
            editor.addButton('lucideicons', {
                type: 'button',
                text: '',
                icon: false,
                tooltip: 'Insert Lucide Icon',
                image: null,
                onPostRender: function () {
                    const button = this.getEl();
                    button.innerHTML = `
                        <button>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-images"><path d="M18 22H4a2 2 0 0 1-2-2V6"></path><path d="m22 13-1.296-1.296a2.41 2.41 0 0 0-3.408 0L11 18"></path><circle cx="12" cy="8" r="2"></circle><rect style="width:16px;height:16px;" width="16" height="16" x="6" y="2" rx="2"></rect></svg>
                        <style>svg.lucide.lucide-images, .lucide.lucide-images * {width: unset; height: unset;}</style></button>
                    `;
                },
                onclick: function () {
                    editor.insertContent('some text');
                }
            });
        }
    });

    tinymce.PluginManager.add('lucideicons', tinymce.plugins.LucideIcons);
})();