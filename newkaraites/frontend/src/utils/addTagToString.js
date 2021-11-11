import pluralize from 'pluralize'
// this is the text that I want to tag, so I said
// tag = b
// arg = I
// this is the text that <b>I</b> want to tag, so <b>I</b> said
// make last word plural if is singular, singular if is plural

export const addTagToString = (string, args, tag) => {
    // all the sentence
     if(pluralize.isPlural(args)) {
         string = string.replace(new RegExp(args, "gi"), `<${tag}>${args}</${tag}>`)
         const singular = pluralize.singular(args)
         string = string.replace(new RegExp(singular, "gi") , `<${tag}>${singular}</${tag}>`)
    }
     if(pluralize.isSingular(args)) {
         string = string.replace(new RegExp(args, "gi"), `<${tag}>${args}</${tag}>`)
         const plural = pluralize.plural(args)
         string = string.replace(new RegExp(plural, "gi") , `<${tag}>${plural}</${tag}>`)
    }
    // individual words
    const arg =  args.split(' ')
    for (let index in arg) {
        const argToReplace = new RegExp(` ${arg[index]} `, "gi")
        string = string.replace(argToReplace, `<${tag}> ${arg[index]} </${tag}>`)
    }
    return string
}
