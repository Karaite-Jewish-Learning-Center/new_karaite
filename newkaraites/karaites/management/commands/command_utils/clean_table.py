def clean_tag_attr(child, table_class=None):
    """ clean all child attr except class and colspan """
    if hasattr(child, 'attrs'):
        class_ = child.attrs.get('class')

        if class_ is not None and ('he-foot-note' in class_ or 'en-foot-note' in class_):
            return child.attrs

        colspan = child.attrs.get('colspan')

        if class_ is None:
            child.attrs = {}
        else:
            child.attrs = {'class': class_}

        if table_class is not None and child.name == 'table':
            child.attrs['class'].append(table_class)

        if colspan == '3' or colspan == '2':
            child.attrs.update({'colspan': '2'})

    return child.attrs


def clean_table_attr(tree):
    for child in tree.find_all(recursive=True):
        child.attrs = clean_tag_attr(child)

    return tree


def process_table(divs):
    table_str = ''
    for table in divs.find_all('table'):
        table.attrs = clean_tag_attr(table)
        table = clean_table_attr(table)
        table_str += str(table)

    return table_str
