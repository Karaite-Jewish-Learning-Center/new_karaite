import { makeRandomKey } from "./utils"


const transform = (refClick, item, kind, paneNumber, node) => {
    if (node.type === 'tag') {
        // rewrite the span with a onClick event handler
        if (node.name === 'span') {
             debugger
            if (node['attribs']['class'] === 'en-biblical-ref') {
                return <span key={makeRandomKey()} lang="EN" onClick={refClick.bind(this, item, kind, paneNumber)} className="en-biblical-ref">{node['children'][0]['data']}</span>
            }
            if (node['attribs']['class'] === 'he-biblical-ref') {
                return <span key={makeRandomKey()} lang="HE" onClick={refClick.bind(this, item, kind, paneNumber)} className="he-biblical-ref">{node['children'][0]['data']}</span>
            }
        }
    }
}

export default transform