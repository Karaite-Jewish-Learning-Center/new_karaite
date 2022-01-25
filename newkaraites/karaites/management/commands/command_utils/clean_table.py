def clean_tag_attr(child, table_class=None):
    """ clean all child attr except class """
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

        if colspan is not None:
            child.attrs.update({'colspan': colspan})

    return child.attrs


def clean_table_attr(tree):
    for child in tree.find_all(recursive=True):
        child.attrs = clean_tag_attr(child)

    return tree
