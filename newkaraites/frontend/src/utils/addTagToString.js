// this is the text that I want to tag, so I said
// tag = b
// arg = I
// this is the text that <b>I</b> want to tag, so <b>I</b> said


export const addTagToString = (string, args, tag) => {
    const arg = args.split(' & ')
    for (let index in args.split(' & ')) {
        const argToReplace = new RegExp(arg[index], "gi")
        string = string.replace(argToReplace, `<${tag}>${arg[index]}</${tag}>`)
    }
    return string
}
