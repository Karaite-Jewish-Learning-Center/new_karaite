import {
    capitalize,
    range,
    equals,
    slug,
    unslug,
    normalizeSluggedBookName,
    calculateItemNumber,
    matchHebrewBookName,
    englishBookNameToHebrew,
    hebrewBookNameToEnglish,
    isABibleBook
} from './utils'

test('Capitalize first letter', () => {
    expect(capitalize('new york')).toBe('New york')
})

test('Capitalize first letter start space', () => {
    expect(capitalize(' new york')).toBe(' new york')
})

test('There are no Capitalize letters in Hebrew', () => {
    expect(capitalize('ושרשיה')).toBe('ושרשיה')
})

test('Make an Array with values in range from 1 to N', () => {
    expect(range(10)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
})

test('Compare 2 arrays return true if they have same values', () => {
    expect(equals([1, 2, 3], [1, 2, 3])).toBeTruthy()
})

test('Compare 2 arrays if sizes are !== return immediately', () => {
    expect(equals([1, 2, 3], [1])).toBeFalsy()
})

test('Compare 2 arrays returns false if values are !==', () => {
    expect(equals([1, 2, 4], [1, 2, 3])).toBeFalsy()
})

test('Compare 2 arrays may not be nested, always return false', () => {
    expect(equals([1, 2, [3]], [1, 2, 3])).toBeFalsy()
})

test('slug replaces spaces with -', () => {
    expect(slug('1 2 3')).toEqual('1-2-3')
})

test('unslug replaces - with spaces', () => {
    expect(unslug('1-2-3')).toEqual('1 2 3')
})

test('Slug unslug return original string', () => {
    expect(unslug(slug('1 2 3'))).toEqual('1 2 3')
})

test('Normalize bible books name', () => {
    expect(normalizeSluggedBookName('leviticus')).toBe('Leviticus')
    expect(normalizeSluggedBookName('levItIcus')).toBe('Leviticus')
    expect(normalizeSluggedBookName('I-kings')).toBe('I-Kings')
    expect(normalizeSluggedBookName('i-kings')).toBe('I-Kings')
    expect(normalizeSluggedBookName('ii-kings')).toBe('II-Kings')
    expect(normalizeSluggedBookName('II-kings')).toBe('II-Kings')
    expect(normalizeSluggedBookName('ii-KINGS')).toBe('II-Kings')
    expect(normalizeSluggedBookName('I Chronicles')).toBe('I-Chronicles')

})

test('Calculate item number for a biblical book', () => {
    expect(calculateItemNumber('genesis', 2, 1)).toBe(31)
    expect(calculateItemNumber('I-kings',10,10)).toBe(371)
    // expect(calculateItemNumber('unknown','10','10')).toBe(371)
})


test('Match Hebrew Book Names', () => {
    // Leviticus 3:10 => ['3:10', 'Leviticus'] in Hebrew may be a , or :
    expect(matchHebrewBookName('ויקרא יא, מג')).toEqual([" יא, מג", "ויקרא"])
    // Deuteronomy 1:16
    expect(matchHebrewBookName('דברים כ, טז')).toEqual([" כ, טז", "דברים"])
    // introduction
    expect(matchHebrewBookName('הקדמה')).toEqual([])
    // introduction 1:16
    expect(matchHebrewBookName('הקדמה כ, טז')).toEqual([])
    // I kings 2:3
    expect(matchHebrewBookName('מלכים א כ, טז')).toEqual([' כ, טז','מלכים א'])
})

test('English book name to Hebrew book name', ()=>{
    expect(englishBookNameToHebrew('Deuteronomy')).toBe('דברים')
    expect(englishBookNameToHebrew('deuteronomy')).toBe('דברים')
    expect(englishBookNameToHebrew(' deuteronomy ')).toBe('דברים')
    expect(englishBookNameToHebrew(' deuTeronOmy ')).toBe('דברים')
})

test('Hebrew book name to English book name', ()=>{
    expect(hebrewBookNameToEnglish('דברים')).toBe('Deuteronomy')
})

it('Is a bible book name', ()=>{
    expect(isABibleBook('Deuteronomy')).toBeTruthy()
    expect(isABibleBook('DeuteronomY')).toBeFalsy()
})

