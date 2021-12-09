import {
    capitalize,
    equals,
    slug,
    unslug,
    normalizeSluggedBookName,
    matchHebrewBookName
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


test('Compare 2 arrays return true if they have same values', () => {
    expect(equals([1, 2, 3], [1, 2, 3])).toBeTruthy()
})

test('Compare 2 arrays if sizes are !== return immediately', () => {
    expect(equals([1, 2, 3], [1])).toBeFalsy()
})

test('Compare 2 arrays returns false if values are !==', () => {
    expect(equals([1, 2, 4], [1, 2, 3])).toBeFalsy()
})

test('Compare 2 arrays may not be nested, always return false ', () => {
    expect(equals([1, 2, [3]], [1, 2, 3])).toBeFalsy()
})


test('slug replaces spaces with -', () => {
    expect(slug('1 2 3')).toEqual('1-2-3')
})

test('unslug replaces - with spaces ', () => {
    expect(unslug('1-2-3')).toEqual('1 2 3')
})

test('Slug unslug return original string', () => {
    expect(unslug(slug('1 2 3'))).toEqual('1 2 3')
})


test('Normalize bible books name', () => {
    expect(normalizeSluggedBookName('leviticus')).toEqual('Leviticus')
})

test('Normalize bible books name', () => {
    expect(normalizeSluggedBookName('I-kings')).toEqual('I-Kings')
})

test('Normalize bible books name', () => {
    expect(normalizeSluggedBookName('II-kings')).toEqual('II-Kings')
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
})