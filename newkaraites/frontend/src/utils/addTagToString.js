// this is the text that I want to tag, so I said
// tag = b
// arg = I
// this is the text that <b>I</b> want to tag, so <b>I</b> said


export const addTagToString = (string, arg, tag) => {
    const argToReplace = new RegExp(arg, "gi")
    return string.replace(argToReplace, `<${tag}>${arg}</${tag}>`)
}
