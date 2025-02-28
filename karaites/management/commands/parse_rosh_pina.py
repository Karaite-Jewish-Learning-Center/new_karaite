import re
from ...models import (Songs,
                       FirstLevel,
                       Classification,
                       KaraitesBookAsArray,
                       KaraitesBookDetails)
from django.core.management.base import BaseCommand
from django.core.exceptions import ObjectDoesNotExist


class Command(BaseCommand):
    help = 'Populate audio bible books with empty start and stop times'

    def save_data(details, songs, line, line_number):
        # save liturgyBook
        try:
            liturgy_book = KaraitesBookAsArray.objects.get(book=details, line_number=line_number)
        except ObjectDoesNotExist:
            liturgy_book = KaraitesBookAsArray()

        liturgy_book.book = details
        liturgy_book.book_text = line
        liturgy_book.line_number = line_number
        liturgy_book.better_book = True
        liturgy_book.save()

    @staticmethod
    def get_replacement(html_string, start_tag):
        pattern = f'<{start_tag}[^>]*>.*?</{start_tag}>'
        return re.findall(pattern, html_string)[0]

    @staticmethod
    def replace_html_block(html_string, start_tag, replacement):
        pattern = f'<{start_tag}[^>]*>.*?</{start_tag}>'
        return re.sub(pattern, f'<{replacement}>', html_string)

    @staticmethod
    def remove_html_block(html_string, start_tag):
        pattern = f'<{start_tag}[^>]*>.*?</{start_tag}>'
        # save the text inside the tag
        text = re.findall(pattern, html_string)
        if len(text) > 0:
            text = text[0]
        else:
            text = ''
        return text, re.sub(pattern, '', html_string)

    @staticmethod
    def insert_after_html_block(html_string, end_tag, replacement):
        pos = html_string.find(end_tag)
        return html_string[:pos] + replacement + html_string[pos:]

    def handle(self, *args, **options):
        """ parse XML file """

        karaites_details = KaraitesBookDetails.objects.get(book_title_en='Rosh pinna')
        karaites_book = KaraitesBookAsArray.objects.filter(book=karaites_details).delete()

        language = ['english', 'hebrew', 'arabic']
        path = '/Users/brainstormxx/PycharmProjects/kjoa/new_karaite/newkaraites/data_karaites/XML/'
        names = ['rosh-pinna-arabic.xml', 'rosh-pinna-english.xml', 'rosh-pinna-hebrew.xml']

        # the three parts must be combined in one row on
        with open(path + 'rosh-pinna-english.xml', 'r') as file:
            english_data = file.readlines()

        with open(path + 'rosh-pinna-hebrew.xml', 'r') as file:
            hebrew_data = file.readlines()

        with open(path + 'rosh-pinna-arabic.xml', 'r') as file:
            arabic_data = file.readlines()

        # remove the first line and the last line (document tags)
        english_data = english_data[1:-1]
        hebrew_data = hebrew_data[1:-1]
        arabic_data = arabic_data[1:-1]

        # some lines are broken into two lines, so we need to combine them
        # based on the opening and closing tags
        i = 0
        while i < len(hebrew_data):

            if hebrew_data[i].find('<quotation>') != -1:
                x = i
                while x < len(hebrew_data) and hebrew_data[x].find('</quotation>') == -1:
                    x += 1

                if x < len(hebrew_data):
                    hebrew_data[i] = hebrew_data[i] + hebrew_data[x]
                    hebrew_data[x] = ''
                    # print('line ', hebrew_data[i])
                    # input('line broken')
            i += 1

        # max length of the three files
        max_length = max(len(english_data), len(hebrew_data), len(arabic_data))
        # make sure all three files have the same length
        english_data.extend([''] * (max_length - len(english_data)))
        hebrew_data.extend([''] * (max_length - len(hebrew_data)))
        arabic_data.extend([''] * (max_length - len(arabic_data)))

        # [hebrew, transliteration, english audio_start, audio_end, song_id,
        # reciter, censored, line_number, comments, end of verse, section or subtext,
        # filler, song end, Arabic]
        # filler = ['', '', '', '', '', '', '', '', 0, '', 0, 1, 0, '']
        i_eng = 0
        i_heb = 0
        i_arb = 0
        while i_eng < max_length:
            karaites_book = KaraitesBookAsArray()
            karaites_book.book = karaites_details

            heb = hebrew_data[i_heb].strip()
            eng = english_data[i_eng].strip()
            arb = arabic_data[i_arb].strip()

            # h1 subtitle
            if eng.startswith('<h1><margin'):
                eng = eng.replace('<h1><margin side="right">', '<div class="eng-subtitle"><div class="eng-right">')
                eng = eng.replace('</margin>', '</div><div class="eng-text">')
                eng = eng.replace('</h1>', '</div></div>')
            elif eng.startswith('<p'):
                eng = eng.replace('<p indent="no">', '<p>')
                eng = eng.replace('<p><margin side="right">', '<div class="eng-container"><div class="eng-right">')
                eng = eng.replace('</margin>', '</div><div class="eng-text"><p>')
                if eng.endswith('</p>'):
                    eng = eng[:-4] + '</div></p></div>'

            if heb.startswith('»') or heb.startswith('«'):
                heb = heb.replace('»', '<span class="heb-quote">')
                heb = heb.replace('«', '</span>')
                input('quote')

            if heb.startswith('<h1><margin'):
                heb = heb.replace('<h1><margin side="right">', '<div class="heb-container sub"><div class="heb-right">')
                heb = heb.replace('</margin>', '</div><div class="heb-text"><h1>')

            if heb.startswith('<quotation>'):

                content = heb.split('<quotation>')[1].split('<margin')[0]
                print('content: ', content, len(content))
                input('quote')
                if len(content) > 0:
                    # we have a quote
                    heb = heb.replace(content, '')
                    part = f'<div class="heb-container quote"><span class="heb-quote-number">{content}</span>'
                else:
                    part = '<div class="heb-container quote">'

                heb = heb.replace('<quotation>', part)
                for i in range(heb.count('<margin')):
                    heb = heb.replace('</margin>', '</div><div class="heb-text"><p>')
                heb = heb.replace('<margin side="right">', '<div class="heb-right">')

                heb = heb.replace('</margin>', '</div><div class="heb-text"><p>')

                heb = heb.replace('</quotation>', '</p></div>')

                if len(content) > 0:
                    text, heb = Command.remove_html_block(heb, '<span class="heb-quote-number">')
                    heb = Command.insert_after_html_block(heb, '<div class="heb-text">', text)
                    print('text: ', text)
                    print('heb: ', heb)
                    input('replaced')

            elif heb.startswith('<p'):
                only_text = heb.replace('<green>', '####').replace('</green>', '____')
                only_text = only_text.replace('<p>', '').replace('</p>', '')
                # single p tag
                if only_text.find('>') == -1 and only_text.find('<') == -1:

                    heb = f'<div class="heb-container"><div class="heb-right empty">&nbsp;</div><div class="heb-text"><p>{only_text}<p></div></div>'

                else:

                    heb = heb.replace('<p indent="no">', '<p>')
                    heb = heb.replace('<p><margin side="right">', '<div class="heb-container"><div class="heb-right">')
                    heb = heb.replace('</margin>', '</div><div class="heb-text"><p>')

                    if heb.endswith('</p>'):
                        heb = heb[:-4] + '</div></p></div>'

            heb = heb.replace('####', '<span class="green">').replace('____', '</span>')

            if arb.startswith('<h1><margin'):
                arb = arb.replace('<h1><margin side="right">', '<div class="arb-subtitle"><div class="arb-right">')
                arb = arb.replace('</margin>', '</div><div> class="arb-text">')
                arb = arb.replace('</h1>', '</div>')

            elif arb.startswith('<p'):
                arb = arb.replace('<p indent="no">', '<p>')
                arb = arb.replace('<p><margin side="right">', '<div class="arb-container"><div class="arb-right">')
                arb = arb.replace('</margin>', '</div><div> class="arb-text"><p>')

                if arb.endswith('</p>'):
                    arb = arb[:-4] + '</div></p></div>'

            karaites_book.book_text = [eng, '', heb, '', '', '', '', '', 0, '', 0, 1, 0, '']
            karaites_book.line_number = i_eng
            karaites_book.paragraph_number = i_eng
            karaites_book.save()
            i_eng += 1
            i_heb += 1
            i_arb += 1
            print('progress: ', i_eng, ' out of ', max_length)
