import prettier from 'prettier';
import parserMarkdown from 'prettier/plugins/markdown';
import { JSDOM } from 'jsdom';
import { convert_documentFragment_to_htmlStr } from '../../contentScript/html_convertor';
import { turndownServiceMain } from '../../contentScript/turndown_service_main';
import { convert_xmlStr_to_documentFragment } from '../html_convertor_jsdom';
// import html_import from './demo_3.html?raw';

let html_raw = String.raw`
`;

const dom = new JSDOM('', { contentType: 'text/html' });
const document = dom.window.document;
const docfrag = JSDOM.fragment(html_raw);
const html = convert_documentFragment_to_htmlStr(document, docfrag);
// console.log(html);
let markdown = turndownServiceMain.turndown(html);
// markdown = await prettier.format(markdown, { parser: 'markdown' });
markdown = await prettier.format(markdown, { parser: 'markdown', plugins: [parserMarkdown] });
console.log(markdown);
