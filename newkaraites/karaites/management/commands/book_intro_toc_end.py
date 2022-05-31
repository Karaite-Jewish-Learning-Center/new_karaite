MESSAGES_END = ['Text', 'Introduction', 'Table of contents']


def generate_book_intro_toc_end(kind):
    html = '<br>'
    html += '<br>'
    html += '<div class="center"><p>{} end.</p>'.format(MESSAGES_END[kind], center='center')
    html += '<br>'
    html += '<br>'
    html += '<br>'
    html += '<br>'
    html += '<br>'
    html += '<br>'
    return html
