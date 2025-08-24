import { JSDOM } from 'jsdom';
import { convert_documentFragment_to_htmlStr } from '../contentScript/html_convertor';
import { convert_xmlStr_to_documentFragment } from './html_convertor_jsdom';

let html = ``;

html = `
AAA
<div id="my-content">
  <div>
    <ms-katex>
      <pre>
        <code>
          foo
        </code>
      </pre>
    </ms-katex>
  </div>
</div>
BBB
`;

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
{
  // pre inside p is not allowed
  const document = new JSDOM('', { contentType: 'text/html' }).window.document;
  const docfrag = JSDOM.fragment(html);
  const htmlStr = convert_documentFragment_to_htmlStr(document, docfrag);
  console.log(htmlStr);
}

{
  // use xml to parse the html string
  // idk that allow of xml and html instance passing
  // seems I just ignored this incompatible thing and let html do the thing, 
  // have to manual fix in xml dom before passing to html dom 
  // having xml str repr is not enough
  const document = new JSDOM('', { contentType: 'text/html' }).window.document;
  const docfrag = convert_xmlStr_to_documentFragment(html);
  const htmlStr = convert_documentFragment_to_htmlStr(document, docfrag);
  console.log(htmlStr);
}

// const serializer = new window.XMLSerializer();
// const xmlString = serializer.serializeToString(docfrag);
// console.log('-----');
// console.log(xmlString);
