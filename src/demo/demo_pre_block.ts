import prettier from 'prettier';
import parserMarkdown from 'prettier/plugins/markdown';
import { JSDOM } from 'jsdom';
import { convert_documentFragment_to_htmlStr } from '../contentScript/html_convertor';
import { turndownServiceMain } from '../contentScript/turndown_service_main';
import { convert_xmlStr_to_documentFragment } from './html_convertor_jsdom';
import { regex_indicator } from '../contentScript/regex_indicator';

let html_raw = '';

html_raw = String.raw`
<p id="efb0" class="pw-post-body-paragraph lv lw gm lx b ly lz ma mb mc md me mf mg mh mi mj mk ml mm mn mo mp mq mr ms gf bl" data-selectable-paragraph=""><strong class="lx gn">Using Segmentation models, a python library with Neural Networks for Image Segmentation based on Keras (Tensorflow) framework for using focal and dice loss</strong></p>
<pre class="mw mx my mz na oh oi oj ok ak ol bl"><span id="db92" class="nh ni gm oi b om on oo m op oq" data-selectable-paragraph="">!pip install segmentation_models</span><span id="5965" class="nh ni gm oi b om ot oo m op oq" data-selectable-paragraph="">import segmentation_models as sm</span><span id="b954" class="nh ni gm oi b om ot oo m op oq" data-selectable-paragraph="">dice_loss = sm.losses.DiceLoss() <br>focal_loss = sm.losses.CategoricalFocalLoss()<br>total_loss = dice_loss + (1 * focal_loss)</span></pre>
`;

const dom = new JSDOM('', { contentType: 'text/html' });
global.Node = dom.window.Node

const document = dom.window.document;
const docfrag = JSDOM.fragment(html_raw);
const html = convert_documentFragment_to_htmlStr(document, docfrag);
console.log(html);
// console.log('---')
let markdown = turndownServiceMain.turndown(html);
// markdown = await prettier.format(markdown, { parser: 'markdown' });
// console.log(markdown);
markdown = markdown.replaceAll(regex_indicator.code_block_beginning, '');
markdown = await prettier.format(markdown, { parser: 'markdown', plugins: [parserMarkdown] });
console.log(markdown);
