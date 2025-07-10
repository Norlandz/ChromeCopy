import { JSDOM } from 'jsdom';
import { convert_documentFragment_to_htmlStr } from '../contentScript/html_convertor';
import { convert_xmlStr_to_documentFragment } from './html_convertor_jsdom';

let html = ``;

html = `
AAA
<div id="my-content">
  <p>
    <ms-katex>
      <pre>
        <code>
          foo
        </code>
      </pre>
    </ms-katex>
  </p>
</div>
BBB
`;

const document = new JSDOM('', { contentType: 'text/html' }).window.document;
const docfrag = convert_xmlStr_to_documentFragment(html);
const htmlStr = convert_documentFragment_to_htmlStr(document, docfrag);
console.log('-----');
console.log(htmlStr);

// const serializer = new window.XMLSerializer();
// const xmlString = serializer.serializeToString(docfrag);
// console.log('-----');
// console.log(xmlString);
