# -*- coding: utf-8 -*-
"""
hebrew.py - functions relating to reading and generating Hebrew numerals.
Issues:
   Numbers like 1 million are ambiguous
   Number like 2000 is ambiguous
   Okay to construct 15/16 and then make tet-vav/etc?


This is based on  sefaria hebrew.py
"""

import math
import re

import regex

# Change to all caps for constants
GERESH = "\u05F3"
GERSHAYIM = "\u05F4"
ALPHABET_22 = "אבגדהוזחטיכלמנסעפצקרשת"
FINAL_LETTERS = "םןץףך"
ALPHABET_27 = ALPHABET_22 + FINAL_LETTERS

H2E_KEYBOARD_MAP = {"/": "q", "׳": "w", "ק": "e", "ר": "r", "א": "t", "ט": "y", "ו": "u", "ן": "i", "ם": "o", "פ": "p",
                    "ש": "a", "ד": "s", "ג": "d", "כ": "f", "ע": "g", "י": "h", "ח": "j", "ל": "k", "ך": "l", "ף": ";",
                    ",": "'", "ז": "z", "ס": "x", "ב": "c", "ה": "v", "נ": "b", "מ": "n", "צ": "m", "ת": ",", "ץ": ".",
                    ".": "/"}

E2H_KEYBOARD_MAP = {"'": ',', ',': '\u05ea', '.': '\u05e5', '/': '.', ';': '\u05e3', 'A': '\u05e9', 'B': '\u05e0',
                    'C': '\u05d1', 'D': '\u05d2', 'E': '\u05e7', 'F': '\u05db', 'G': '\u05e2', 'H': '\u05d9',
                    'I': '\u05df', 'J': '\u05d7', 'K': '\u05dc', 'L': '\u05da', 'M': '\u05e6', 'N': '\u05de',
                    'O': '\u05dd', 'P': '\u05e4', 'Q': '/', 'R': '\u05e8', 'S': '\u05d3', 'T': '\u05d0', 'U': '\u05d5',
                    'V': '\u05d4', 'W': '\u05f3', 'X': '\u05e1', 'Y': '\u05d8', 'Z': '\u05d6', 'a': '\u05e9',
                    'b': '\u05e0', 'c': '\u05d1', 'd': '\u05d2', 'e': '\u05e7', 'f': '\u05db', 'g': '\u05e2',
                    'h': '\u05d9', 'i': '\u05df', 'j': '\u05d7', 'k': '\u05dc', 'l': '\u05da', 'm': '\u05e6',
                    'n': '\u05de', 'o': '\u05dd', 'p': '\u05e4', 'q': '/', 'r': '\u05e8', 's': '\u05d3', 't': '\u05d0',
                    'u': '\u05d5', 'v': '\u05d4', 'w': '\u05f3', 'x': '\u05e1', 'y': '\u05d8', 'z': '\u05d6'}

KEYBOARD_SWAP_MAP = {"/": "q", "׳": "w", "ק": "e", "ר": "r", "א": "t", "ט": "y", "ו": "u", "ן": "i", "ם": "o", "פ": "p",
                     "ש": "a", "ד": "s", "ג": "d", "כ": "f", "ע": "g", "י": "h", "ח": "j", "ל": "k", "ך": "l", "ף": ";",
                     ",": "'", "ז": "z", "ס": "x", "ב": "c", "ה": "v", "נ": "b", "מ": "n", "צ": "m", "ת": ",", "ץ": ".",
                     ".": "/",
                     "'": ',', ',': '\u05ea', '.': '\u05e5', '/': '.', ';': '\u05e3', 'A': '\u05e9', 'B': '\u05e0',
                     'C': '\u05d1', 'D': '\u05d2', 'E': '\u05e7', 'F': '\u05db', 'G': '\u05e2', 'H': '\u05d9',
                     'I': '\u05df', 'J': '\u05d7', 'K': '\u05dc', 'L': '\u05da', 'M': '\u05e6', 'N': '\u05de',
                     'O': '\u05dd', 'P': '\u05e4', 'Q': '/', 'R': '\u05e8', 'S': '\u05d3', 'T': '\u05d0', 'U': '\u05d5',
                     'V': '\u05d4', 'W': '\u05f3', 'X': '\u05e1', 'Y': '\u05d8', 'Z': '\u05d6', 'a': '\u05e9',
                     'b': '\u05e0', 'c': '\u05d1', 'd': '\u05d2', 'e': '\u05e7', 'f': '\u05db', 'g': '\u05e2',
                     'h': '\u05d9', 'i': '\u05df', 'j': '\u05d7', 'k': '\u05dc', 'l': '\u05da', 'm': '\u05e6',
                     'n': '\u05de', 'o': '\u05dd', 'p': '\u05e4', 'q': '/', 'r': '\u05e8', 's': '\u05d3', 't': '\u05d0',
                     'u': '\u05d5', 'v': '\u05d4', 'w': '\u05f3', 'x': '\u05e1', 'y': '\u05d8', 'z': '\u05d6'}


def heb_to_int(unicode_char):
    """Converts a single Hebrew unicode character into its Hebrew numerical equivalent."""

    hebrew_numerals = {
        "\u05D0": 1,
        "\u05D1": 2,
        "\u05D2": 3,
        "\u05D3": 4,
        "\u05D4": 5,
        "\u05D5": 6,
        "\u05D6": 7,
        "\u05D7": 8,
        "\u05D8": 9,
        "\u05D9": 10,
        "\u05DB": 20,
        "\u05DC": 30,
        "\u05DE": 40,
        "\u05E0": 50,
        "\u05E1": 60,
        "\u05E2": 70,
        "\u05E4": 80,
        "\u05E6": 90,
        "\u05E7": 100,
        "\u05E8": 200,
        "\u05E9": 300,
        "\u05EA": 400,  # u"\u05F3": "'", # Hebrew geresh  # u"\u05F4": '"', # Hebrew gershayim  # u"'":	   "'",
        "\u05DA": 20,  # khaf sofit
        "\u05DD": 40,  # mem sofit
        "\u05DF": 50,  # nun sofit
        "\u05E3": 80,  # peh sofit
        "\u05E5": 90,  # tzadi sofit
    }

    if unicode_char not in list(hebrew_numerals.keys()):
        raise KeyError("Invalid Hebrew numeral character {}".format(unicode_char))

    else:
        return hebrew_numerals[unicode_char]


def split_thousands(n, little_endian=True):
    """
    Takes a string representing a Hebrew numeral, returns a tuple of the component thousands
    places.  Requires a geresh (apostrophe or '\\u05F3') to indicate thousands.
    Ignores single geresh at end for numbers < 10.

    Default returns the smallest thousands group first in the tuple (little-endian).  Can be changed
    to big-endian by setting little_endian=False.
    """

    # Ignore geresh on digit < 10, if present
    if n[-1] == GERESH or n[-1] == "'" or n[-1] == "\u2018" or n[-1] == "\u2019":
        n = n[:-1]

    # assume that two single quotes in a row should be a double quote. '' -> "
    n = n.replace(GERESH, "'").replace("''", "\"")

    ret = n.split("'")
    if little_endian:
        return reversed(ret)
    else:
        return ret


def heb_string_to_int(n):
    """
    Takes a single thousands block of Hebrew characters, and returns the integer value of
    that set of characters, ignoring thousands order of magnitude.

    >>> heb_string_to_int(u'\\u05ea\\u05e9\\u05e1\\u05d3') # = u'תשסד'
    764
    """

    n = re.sub('[\u05F4"\u201d]', '', n)  # remove gershayim, double quote, or fancy double quote
    return sum(map(heb_to_int, n))


def decode_hebrew_numeral(n):
    """
    Takes any string representing a Hebrew numeral and returns it integer value.

    >>> decode_hebrew_numeral(u'ה׳תשס״ד')
    5764
    """

    t = list(map(heb_string_to_int, split_thousands(n)))  # split and convert to numbers
    t = [pow(10, 3 * E_num[0]) * E_num[1] for E_num in enumerate(t)]  # take care of thousands and add
    return sum(t)


# ENCODING

def chunks(l, n):
    """
    Yield successive n-sized chunks from l.
    """
    for i in range(0, len(l), n):
        yield l[i:i + n]


def int_to_heb(integer):
    """
    Converts an integer that can be expressed by a single Hebrew character (1..9, 10..90, 100.400)
    and returns the Hebrew character that represents that integer.

    Also accepts values divisible by 100 from 500 to 1100.

    >> int_to_heb(10)          #This fails as a doctest.  The yud isn't seen as u'\\u05d9'
    י
    >> int_to_heb(800)          #TavTav is not seen as u'\\u05ea\\u05ea'
    תת
    """

    hebrew_numerals = {
        0: "",
        1: "\u05D0",
        2: "\u05D1",
        3: "\u05D2",
        4: "\u05D3",
        5: "\u05D4",
        6: "\u05D5",
        7: "\u05D6",
        8: "\u05D7",
        9: "\u05D8",
        10: "\u05D9",
        15: "\u05D8\u05D5",  # Will not be hit when used with break_int_magnitudes
        16: "\u05D8\u05D6",  # Will not be hit when used with break_int_magnitudes
        20: "\u05DB",
        30: "\u05DC",
        40: "\u05DE",
        50: "\u05E0",
        60: "\u05E1",
        70: "\u05E2",
        80: "\u05E4",
        90: "\u05E6",
        100: "\u05E7",
        200: "\u05E8",
        300: "\u05E9",
        400: "\u05EA",
    }

    # Fill in hebrew_numeral mappings up to 1100
    for num in range(500, 1200, 100):
        hebrew_numerals[num] = hebrew_numerals[400] * (num // 400) + hebrew_numerals[num % 400]

    if integer > 1100:
        raise KeyError("Asked to convert individual integer {} above 1100; too large.".format(integer))

    else:
        return hebrew_numerals[integer]


def break_int_magnitudes(n, start=None):
    """break_int_magnitudes(n, start=None)

    Accepts an integer and an optional integer (multiple of 10) for at what order of
    magnitude to start breaking apart the integer.  If no option "start" is provided,
    function will determine the size of the input integer and start that the largest order
    of magnitude.

    Returns a big-endian list of the various orders of magnitude, by 10s, broken apart.

    >>> break_int_magnitudes(1129, 100)
    [1100, 20, 9]

    >>> break_int_magnitudes(2130)
    [2000, 100, 30, 0]

    >>> break_int_magnitudes(15000)
    [10000, 5000, 0, 0, 0]
    """

    if type(n) is not int:
        raise TypeError("Argument 'n' must be int, {} provided.".format(type(n)))

    # if n == 0:
    # 	return [0]

    # Set a default for 'start' if none specified
    if start is not None:
        if not (start % 10 == 0 or start == 1):
            raise TypeError("Argument 'start' must be 1 or divisible by 10, {} provided.".format(start))
    else:
        start = 10 ** int(math.log10(n))

    if start == 1:
        return [n]
    else:
        return [n // start * start] + break_int_magnitudes(n - n // start * start, start=start // 10)


def sanitize(input_string, punctuation=True):
    """sanitize(input_string, punctuation=True)

    Takes a Hebrew number input string and applies appropriate formatting and changes.  This function
    includes any special cases, like 15 and 16.

    Optional addition of gershayim or geresh at end where appropriate with "punctuation" arg.
    Thousands geresh will be added regardless from previous functions.

    Note that high numbers may appear oddly due to lack of convention.  For example,
    the sanitized version of 15000 will appear as טו׳.

    """

    # deal with 15 and 16
    # Should we support numbers like 15,000?  Would that look like tet-vav-geresh?

    # if input_string[-2:] in (encode_small_hebrew_numeral(15), encode_small_hebrew_numeral(16)):
    # 	input_string = input_string[:-2] + int_to_heb(heb_string_to_int(input_string[-2:]))

    # This takes care of all instances of 15/16, even in the thousands

    replacement_pairs = (
        ('\u05d9\u05d4', '\u05d8\u05d5'),  # 15
        ('\u05d9\u05d5', '\u05d8\u05d6'),  # 16
        ('\u05e8\u05e2\u05d4', '\u05e2\u05e8\u05d4'),  # 275
        ('\u05e8\u05e2\u05d1', '\u05e2\u05e8\u05d1'),  # 272
        ('\u05e8\u05e2', '\u05e2\u05e8'),  # 270
    )

    for wrong, right in replacement_pairs:
        input_string = re.sub(wrong, right, input_string)

    if punctuation:
        # add gershayim at end
        if len(input_string) > 1:
            if GERESH not in input_string[-2:]:
                input_string = input_string[:-1] + GERSHAYIM + input_string[-1:]
        else:
            # or, add single geresh at end
            input_string += GERESH

    return input_string


def decompose_presentation_forms(orig_char):
    decomp_map = {'יִ': '\u05d9\u05b4',
                  'ﬞ ': '\u05bf',
                  'ײַ': '\u05f2\u05b7',
                  'ﬠ': '\u05e2',
                  'ﬡ': '\u05d0',
                  'ﬢ': '\u05d3',
                  'ﬣ': '\u05d4',
                  'ﬤ': '\u05db',
                  'ﬥ': '\u05dc',
                  'ﬦ': '\u05dd',
                  'ﬧ': '\u05e8',
                  'ﬨ': '\u05ea',
                  'שׁ': '\u05e9\u05c1',
                  'שׂ': '\u05e9\u05c2',
                  'שּׁ': '\u05e9\u05bc\u05c1',
                  'שּׂ': '\u05e9\u05bc\u05c2',
                  'אַ': '\u05d0\u05b7',
                  'אָ': '\u05d0\u05b8',
                  'אּ': '\u05d0\u05bc',
                  'בּ': '\u05d1\u05bc',
                  'גּ': '\u05d2\u05bc',
                  'דּ': '\u05d3\u05bc',
                  'הּ': '\u05d4\u05bc',
                  'וּ': '\u05d5\u05bc',
                  'זּ': '\u05d6\u05bc',
                  'טּ': '\u05d8\u05bc',
                  'יּ': '\u05d9\u05bc',
                  'ךּ': '\u05da\u05bc',
                  'כּ': '\u05db\u05bc',
                  'לּ': '\u05dc\u05bc',
                  'מּ': '\u05de\u05bc',
                  'נּ': '\u05e0\u05bc',
                  'סּ': '\u05e1\u05bc',
                  'ףּ': '\u05e3\u05bc',
                  'פּ': '\u05e4\u05bc',
                  'צּ': '\u05e6\u05bc',
                  'קּ': '\u05e7\u05bc',
                  'רּ': '\u05e8\u05bc',
                  'שּ': '\u05e9\u05bc',
                  'תּ': '\u05ea\u05bc',
                  'וֹ': '\u05d5\u05b9',
                  'בֿ': '\u05d1\u05bf',
                  'כֿ': '\u05db\u05bf',
                  'פֿ': '\u05e4\u05bf',
                  'ﭏ': '\u05d0\u05dc'
                  }
    # if isinstance(orig_char, str): #needs to be unicode
    #	orig_char = str(orig_char, 'utf-8')
    return decomp_map.get(orig_char, '')


presentation_re = re.compile(r"[\uFB1D-\uFB4F]")


def decompose_presentation_forms_in_str(orig_str):
    return presentation_re.sub(lambda match: decompose_presentation_forms(match.group()), orig_str)


def normalize_final_letters(orig_char):
    decomp_map = {
        "\u05DA": "\u05DB",  # khaf sofit
        "\u05DD": "\u05DE",  # mem sofit
        "\u05DF": "\u05E0",  # nun sofit
        "\u05E3": "\u05E4",  # peh sofit
        "\u05E5": "\u05E6",  # tzadi sofit
    }

    # if isinstance(orig_char, str): #needs to be unicode
    #	orig_char = str(orig_char, 'utf-8')
    return decomp_map.get(orig_char, '')


final_letter_re = re.compile("[" + FINAL_LETTERS + "]")


def normalize_final_letters_in_str(orig_str):
    return final_letter_re.sub(lambda match: normalize_final_letters(match.group()), orig_str)


def swap_keyboards_for_letter(orig_char):
    """

    """

    # if isinstance(orig_char, str):  # needs to be unicode
    #	orig_char = str(orig_char, 'utf-8')
    return KEYBOARD_SWAP_MAP.get(orig_char, orig_char)


def swap_keyboards_for_string(orig_str):
    return re.sub(r".", lambda match: swap_keyboards_for_letter(match.group()), orig_str)


def encode_small_hebrew_numeral(n):
    """
    Takes an integer under 1200 and returns a string encoding it as a Hebrew numeral.
    """

    if n >= 1200:
        raise ValueError("Tried to encode small numeral >= 1200.")
    else:
        return ''.join(map(int_to_heb, break_int_magnitudes(n, 100)))


def encode_hebrew_numeral(n, punctuation=True):
    """encode_hebrew_numeral(n, punctuation=True)

    Takes an integer and returns a string encoding it as a Hebrew numeral.
    Optional "punctuation" argument adds gershayim between last two characters
    or final geresh.

    Under 1200, will use taf-taf-shin, etc.
    Above 1200, will use aleph + geresh for thousands.

    This function is not intended for numbers 1,000,000 or more, as there is not currently
    an established convention and there can be ambiguity.  This can be the same for numbers like
    2000 (which would be displayed as bet-geresh) and should instead possibly use words, like "bet elef."
    """

    if n < 1200:
        ret = encode_small_hebrew_numeral(n)
    else:

        # Break into magnitudes, then break into thousands buckets, big-endian
        ret = list(chunks(list(reversed(break_int_magnitudes(n))), 3))

        # Eliminate the orders of magnitude in preparation for being encoded
        ret = [int(sum(x_y[1]) * pow(10, -3 * x_y[0])) for x_y in enumerate(ret)]

        # encode and join together, separating thousands with geresh
        ret = GERESH.join(map(encode_small_hebrew_numeral, reversed(ret)))

    ret = sanitize(ret, punctuation)

    return ret


def encode_hebrew_daf(daf):
    """
    Turns a daf string ("21a") to a hebrew daf string ("כא.")
    """
    daf, amud = daf[:-1], daf[-1]
    amud_mark = {"a": ".", "b": ":"}[amud]
    return encode_hebrew_numeral(int(daf), punctuation=False) + amud_mark


def strip_nikkud(raw_string):
    return regex.sub(r"[\u0591-\u05C7]", "", raw_string)


# todo: rewrite to handle edge case of hebrew words
#  in english texts, and latin characters in Hebrew text
def is_hebrew(s, heb_only=False):
    if not heb_only and regex.search("\p{Hebrew}", s):
        return True
    elif heb_only and regex.search("\p{Hebrew}", s) and not regex.search("[a-zA-Z]", s):
        return True
    return False


def strip_cantillation(text, strip_vowels=False):
    if strip_vowels:
        strip_regex = re.compile(r"[\u0591-\u05bd\u05bf-\u05c5\u05c7]", re.UNICODE)
    else:
        strip_regex = re.compile(r"[\u0591-\u05af\u05bd\u05bf\u05c0\u05c4\u05c5]", re.UNICODE)
    return strip_regex.sub('', text)


def has_cantillation(text, detect_vowels=False):
    if detect_vowels:
        rgx = re.compile(r"[\u0591-\u05bd\u05bf-\u05c5\u05c7]", re.UNICODE)
    else:
        rgx = re.compile(r"[\u0591-\u05af\u05bd\u05bf\u05c0\u05c4\u05c5]", re.UNICODE)
    return bool(rgx.search(text))


def gematria(string):
    """Returns the gematria of `str`, ignore any characters in string that have now gematria (like spaces)"""
    total = 0
    for letter in string:
        try:
            total += heb_to_int(letter)
        except:
            pass
    return total


def hebrew_plural(s):
    """
    Hebrew friendly plurals
    """
    known = {
        "Daf": "Dappim",
        "Mitzvah": "Mitzvot",
        "Negative Mitzvah": "Negative Mitzvot",
        "Positive Mitzvah": "Positive Mitzvot",
        "Mitsva": "Mitzvot",
        "Mesechet": "Mesechtot",
        "Perek": "Perokim",
        "Siman": "Simanim",
        "Seif": "Seifim",
        "Se'if": "Se'ifim",
        "Seif Katan": "Seifim Katanim",
        "Mishnah": "Mishnayot",
        "Mishna": "Mishnayot",
        "Chelek": "Chelekim",
        "Parasha": "Parshiot",
        "Parsha": "Parshiot",
        "Pasuk": "Psukim",
        "Midrash": "Midrashim",
        "Teshuva": "Teshuvot",
        "Aliyah": "Aliyot",
        "Tikun": "Tikunim",
    }

    return known[s] if s in known else str(s) + "s"

#
# def hebrew_term(s):
#     from sefaria.model import library
#     from sefaria.system.exceptions import BookNameError
#
#     if is_hebrew(s):
#         return s
#
#     term = library.get_simple_term_mapping().get(s)
#     if term:
#         return term["he"]
#     else:
#         try:
#             # If s is a text title, look for a stored Hebrew title
#             i = library.get_index(s)
#             return i.get_title("he")
#         except BookNameError:
#             return ''
#
#
# def hebrew_parasha_name(value):
#     """
#     Returns a Hebrew ref for the english ref passed in.
#     """
#     from sefaria.model import Term, library
#     if not value:
#         return ""
#     if "-" in value:
#         if value == "Lech-Lecha":
#             return hebrew_parasha_name(value.replace("-", " "))
#         else:
#             names = value.split("-")
#             return ("-").join(map(hebrew_parasha_name, names))
#     else:
#         try:
#             parasha = library.get_simple_term_mapping().get(value)["he"]
#         except Exception as e:
#             logger.error(str(e))
#             parasha = value
#         return parasha
