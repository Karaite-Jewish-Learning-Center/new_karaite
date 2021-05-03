var script = document.createElement('script');
script.type = 'text/javascript/other';
script.src = "https://cdn.tiny.cloud/1/no-api-key/tinymce/5/tinymce.min.js";
document.head.appendChild(script);

script.onload = function () {
    tinymce.init({
        selector: 'textarea#id_comment_en',
        menu: {
            file: {title: 'File', items: 'newdocument restoredraft | preview | print '},
            edit: {title: 'Edit', items: 'undo redo | cut copy paste | selectall | searchreplace'},
            view: {
                title: 'View',
                items: 'code | visualaid visualchars visualblocks | spellchecker | preview fullscreen'
            },
            insert: {
                title: 'Insert',
                items: 'image link media template codesample inserttable | charmap emoticons hr | pagebreak nonbreaking anchor toc | insertdatetime'
            },
            format: {
                title: 'Format',
                items: 'bold italic underline strikethrough superscript subscript codeformat | formats blockformats fontformats fontsizes align lineheight | forecolor backcolor | removeformat'
            },
            tools: {title: 'Tools', items: 'spellchecker spellcheckerlanguage'},
            table: {title: 'Table', items: 'inserttable | cell row column | tableprops deletetable'},
            help: {title: 'Help', items: 'help'},
            language: "en_US",
            content_css: '../css/comments.css'
        }
    });

}