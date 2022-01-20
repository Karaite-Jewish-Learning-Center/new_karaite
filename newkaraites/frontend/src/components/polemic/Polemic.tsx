import React from 'react'
import {RenderMenuSecondLevel} from '../menu/RenderMenuSecondLevel';
import {booksIntro} from '../../types/commonTypes';

// should be an API call
const books: booksIntro[] = [
  {
    "book_id": 498,
    "book_first_level": 5,
    "book_language": "he",
    "book_classification": "07",
    "book_title": "Sefer Milḥamot Adonai, Sefer Milḥamot Hashem, ספר מלחמות ה'",
    "intro": "<p class=\"MsoNormal p-118\" dir=\"LTR\"><b><span class=\"span-254\">Category: </span></b><span class=\"span-254\">Polemic</span></p><p class=\"MsoNormal p-118\" dir=\"LTR\"><b><span class=\"span-254\">Genre: </span></b><span class=\"span-254\">Poetry</span></p><p class=\"MsoNormal p-118\" dir=\"LTR\"><b><span class=\"span-254\">Acrostic:</span></b><span class=\"span-254\">\nAlternating forward alphabets (</span><span class=\"span-254\" dir=\"RTL\" lang=\"HE\">אבג\"ד</span><span dir=\"LTR\"></span><span dir=\"LTR\"></span><span class=\"span-254\"><span dir=\"LTR\"></span><span dir=\"LTR\"></span>)\nwith backward alphabets (</span><span class=\"span-254\" dir=\"RTL\" lang=\"HE\">תשר\"ק</span><span dir=\"LTR\"></span><span dir=\"LTR\"></span><span class=\"span-254\"><span dir=\"LTR\"></span><span dir=\"LTR\"></span>)</span></p><p class=\"MsoNormal p-118\" dir=\"LTR\"><b><span class=\"span-254\">Author</span></b><span class=\"span-254\">: Salmon\nben Yeruḥim, </span><span class=\"span-254\" dir=\"RTL\" lang=\"HE\">סלמון בן ירוחים</span><span class=\"span-254\"></span></p><p class=\"MsoNormal p-118\" dir=\"LTR\"><b><span class=\"span-254\">Date: </span></b><span class=\"span-254\">10<sup>th</sup>\nCentury</span><span class=\"span-255\"></span></p><p class=\"MsoNormal p-118\" dir=\"LTR\"><b><span class=\"span-255\">Location:</span></b><span class=\"span-255\"> Palestine;\nLand of Israel; </span><span class=\"span-256\">ארץ ישראל</span><span class=\"span-257\"></span></p><p class=\"MsoNormal p-118\" dir=\"LTR\"><b><span class=\"span-254\">Source:</span></b><span class=\"span-254\"> Israel\nDavidson, ed., </span><span class=\"span-254\" dir=\"RTL\" lang=\"HE\">ספר מלחמות ה'</span><span dir=\"LTR\"></span><span dir=\"LTR\"></span><span class=\"span-254\" lang=\"HE\"><span dir=\"LTR\"></span><span dir=\"LTR\"></span> </span><i><span class=\"span-254\">The Book\nof the Wars of the Lord</span></i><span class=\"span-254\"> <i>Containing the Polemics of the Karaite\nSalmon ben Yeruhim against Saadia Gaon</i> (New York: Jewish Theological\nSeminary of America, 1934)</span></p><p class=\"MsoNormal p-118\" dir=\"LTR\"><b><span class=\"span-254\">Text Status</span></b><span class=\"span-254\">: Not\nproofread</span></p><span class=\"span-258\" dir=\"RTL\" lang=\"AR-SA\"><br class=\"br-10\" clear=\"all\"/>\n</span>"
  }
]

const Polemic = () => <RenderMenuSecondLevel books={books} path='polemic' languages={['en', 'he']}/>

export default Polemic