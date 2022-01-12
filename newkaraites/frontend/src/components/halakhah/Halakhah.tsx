import React from 'react'

import { booksIntro} from '../../types/commonTypes'
import {RenderMenuSecondLevel} from '../menu/RenderMenuSecondLevel';

// this will be an api call !
const books: booksIntro[] = [
  {
    "book_id": 434,
    "book_first_level": 3,
    "book_language": "he",
    "book_classification": "03",
    "book_title": "Yeriot Shelomo Volume 1,  יריעות שלמה",
    "intro": "<p class=\"MsoNormal\"><b>Author: </b>R. Shelomo Afeda Ha-Kohen / ר שלמה אפידה הכהן</p>\n<p class=\"MsoNormal\"><b>Date Written:</b> 1860</p>\n<p class=\"MsoNormal\"><b>Location: </b> Constantinople / קושטא</p>\n<p class=\"MsoNormal\"><b>Edition:</b>Ramla 1986</p>\n"
  },
  {
    "book_id": 435,
    "book_first_level": 3,
    "book_language": "he",
    "book_classification": "03",
    "book_title": "Yeriot Shelomo Volume 2,  יריעות שלמה",
    "intro": "<p class=\"MsoNormal\"><b>Author: </b>R. Shelomo Afeda Ha-Kohen / ר שלמה אפידה הכהן</p>\n<p class=\"MsoNormal\"><b>Date Written:</b> 1860</p>\n<p class=\"MsoNormal\"><b>Location: </b> Constantinople / קושטא</p>\n<p class=\"MsoNormal\"><b>Edition:</b>Ramla 1986</p>\n"
  },
  {
    "book_id": 436,
    "book_first_level": 3,
    "book_language": "he",
    "book_classification": "03",
    "book_title": "Adderet Eliyahu, אדרת אליהו",
    "intro": "<p class=\"MsoNormal\"><b>Author: </b>R. Elijah Ben Moshe Bashyachi / ר אליהו בן משה בשיצי</p>\n<p class=\"MsoNormal\"><b>Date Written:</b> 15th Century</p>\n<p class=\"MsoNormal\"><b>Location: </b>Adrianople / אדריאנופול</p>\n<p class=\"MsoNormal\"><b>Edition:</b>The edition presented here uses the 1530-1531 first edition printing, דפוס ראשון, as its base text. Substantive divergences from that text found in the 1835 printing, דפוס א, or the 1870 printing, דפוס ב, are indicated in the footnotes. (Spelling-convention differences which do not affect meaning in any way, such as ענין vs. עניין or שוטה vs סוטה, are not noted.)</p>\n<p class=\"MsoNormal\"><b>English Introductory Note:</b>Eliyahu Bashyatzi’s Adderet Eliyahu (continued after his death by his student and brother-in-law Caleb Afendopolo, and originally circulated in handwritten manuscript form) has been published in three previous print editions. The first edition was printed in Constantinople by Gershom Soncino c. 1530-1531, four decades after the primary author’s death. A modern reprinting was done by Abraham Firkovich in 1835 in Gözleve (Eupatoria); another was done by Isaac Beim in 1870 in Odessa. All three printings were available to us as scanned documents; our warmest thanks are extended to Tomer Mangoubi for pointing us to the scan of the first edition.</p>\n"
  }
]
const Halakhah = () =>{
    return <RenderMenuSecondLevel books={books} path='Halakhah' languages={['en', 'he']}/>
}

export default Halakhah