def clean_tag_attr(child, table_class=None):
    """ clean all child attr except class """
    if hasattr(child, 'attrs'):
        class_ = child.attrs.get('class')
        colspan = child.attrs.get('colspan')

        if class_ is None:
            child.attrs = {}
        else:
            child.attrs = {'class': class_}

        if table_class is not None:
            child.attrs['class'] = table_class

        if colspan is not None:
            child.attrs.update({'colspan': colspan})

    return child.attrs


def clean_table_attr(tree):

    for child in tree.find_all(recursive=True):
        child.attrs = clean_tag_attr(child)

    return tree
