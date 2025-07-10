import { JSDOM } from 'jsdom';

export function convert_xmlStr_to_documentFragment(xmlStr: string): DocumentFragment {
  // To parse as XML, the string must have a single root element.
  const wrappedHtml = `<root>${xmlStr.trim()}</root>`;
  const document = new JSDOM(wrappedHtml, { contentType: 'application/xml' }).window.document;
  const docfrag = document.createDocumentFragment();
  // Move all child nodes from the document's root element into the fragment.
  while (document.documentElement.firstChild) {
    docfrag.appendChild(document.documentElement.firstChild);
  }
  return docfrag;
}
