import prettier from 'prettier';
import parserMarkdown from 'prettier/plugins/markdown';
import { JSDOM } from 'jsdom';
import { convert_documentFragment_to_htmlStr } from '../contentScript/html_convertor';
import { turndownServiceMain } from '../contentScript/turndown_service_main';
import { convert_xmlStr_to_documentFragment } from './html_convertor_jsdom';
import { regex_indicator } from '../contentScript/regex_indicator';

let html = '';

html = `
<div class="highlight-python notranslate">
  <div class="highlight">
    <pre id="codecell2" tabindex="-1"><span></span><span class="c1"># import sample data</span>
  <span class="kn">from</span><span class="w"> </span><span class="nn">skimage.data</span><span class="w"> </span><span class="kn">import</span> <span class="n">cells3d</span>
  
  <span class="kn">import</span><span class="w"> </span><span class="nn">napari</span>
  
  <span class="n">viewer</span><span class="p">,</span> <span class="n">image_layer</span> <span class="o">=</span> <span class="n">napari</span><span class="o">.</span><span class="n">imshow</span><span class="p">(</span><span class="n">cells3d</span><span class="p">())</span>
  
  <span class="c1"># print shape of image data</span>
  <span class="nb">print</span><span class="p">(</span><span class="n">image_layer</span><span class="o">.</span><span class="n">data</span><span class="o">.</span><span class="n">shape</span><span class="p">)</span>
  
  <span class="c1"># start the event loop and show the viewer</span>
  <span class="n">napari</span><span class="o">.</span><span class="n">run</span><span class="p">()</span>
  </pre>
  </div>
</div>
`;

const document = new JSDOM('', { contentType: 'text/html' }).window.document;
const docfrag = JSDOM.fragment(html);
html = convert_documentFragment_to_htmlStr(document, docfrag);
console.log(html);
// console.log('---')
let markdown = turndownServiceMain.turndown(html);
// markdown = await prettier.format(markdown, { parser: 'markdown' });
// console.log(markdown);
markdown = markdown.replaceAll(regex_indicator.code_block_beginning, '');
markdown = await prettier.format(markdown, { parser: 'markdown', plugins: [parserMarkdown] });
console.log(markdown);
