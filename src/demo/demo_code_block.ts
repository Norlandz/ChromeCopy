import prettier from 'prettier';
import parserMarkdown from 'prettier/plugins/markdown';
import { JSDOM } from 'jsdom';
import { convert_documentFragment_to_htmlStr } from '../contentScript/html_convertor';
import { turndownServiceMain } from '../contentScript/turndown_service_main';
import { convert_xmlStr_to_documentFragment } from './html_convertor_jsdom';
import { regex_indicator } from '../contentScript/regex_indicator';

let html = '';

html = `
<ms-code-block>
<div>
  <div>AA</div>
  <div>
  <pre>      <code><span class="hljs-comment"># Our data from the previous step</span>
  target_token_id = <span class="hljs-number">12</span>
  y[target_token_id] = <span class="hljs-number">1</span>
  </code></pre>
  </div>
  <div>BB</div>
</div>
</ms-code-block>
`;

// <div style="display: none;">&nbsp;</div>
html = `
<ms-code-block>
<div>
<pre>                      <code>  <span class="hljs-comment"># Our data from the previous step</span>
target_token_id = <span class="hljs-number">12</span>
y[target_token_id] = <span class="hljs-number">1</span>
</code></pre>
</div>
</ms-code-block>
`;


const document = new JSDOM('', { contentType: 'text/html' }).window.document;
const docfrag = JSDOM.fragment(html);
html = convert_documentFragment_to_htmlStr(document, docfrag);
// console.log(html);
// console.log('---')
let markdown = turndownServiceMain.turndown(html);
// markdown = await prettier.format(markdown, { parser: 'markdown' });
// console.log(markdown);
markdown = markdown.replace(regex_indicator.code_block_beginning, '');
markdown = await prettier.format(markdown, { parser: 'markdown', plugins: [parserMarkdown] });
console.log(markdown);
