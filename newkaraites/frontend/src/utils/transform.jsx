import { makeRandomKey } from "./utils";


const transform = (refClick, node) => {
    if (node.type === 'tag') {
        // rewrite the span with a onClick event handler
        if (node.name === 'span') {
            if (node['attribs']['class'] === 'en-biblical-ref') {
                return <span key={makeRandomKey()} lang="EN" onClick={refClick} className="en-biblical-ref">{node['children'][0]['data']}</span>
            }
            if (node['attribs']['class'] === 'he-biblical-ref') {
                return <span key={makeRandomKey()} lang="HE" onClick={refClick} className="he-biblical-ref">{node['children'][0]['data']}</span>
            }
        }

    }
}

export default transform