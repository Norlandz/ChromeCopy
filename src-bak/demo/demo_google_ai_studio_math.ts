import prettier from 'prettier';
import parserMarkdown from 'prettier/plugins/markdown';
import { JSDOM } from 'jsdom';
import { convert_documentFragment_to_htmlStr } from '../contentScript/html_convertor';
import { turndownServiceMain } from '../contentScript/turndown_service_main';
import { convert_xmlStr_to_documentFragment } from './html_convertor_jsdom';

let html = '';

html = `
<div id="full-test-suite">
  <h1>Main Document Title</h1>
  <p>
    This is an introductory paragraph. It includes <strong>bold text</strong>, <em>italic text</em>,
    and a link to the <a href="https://github.com/mixmark-io/turndown">Turndown repository</a>.
    We can also add <del>strikethrough text</del> and some inline <code>code()</code>.
    Let's test escaping of special characters like *this*.
  </p>

  <p>Here is a second paragraph that demonstrates a hard line break.<br>This new line should start right after a backslash.</p>

  <h2>An Image and a Rule</h2>
  <p>Here is an image with a title:</p>
  <img src="/path/to/image.jpg" alt="A descriptive alt text" title="A cool tooltip title">
  <hr>

  <h2>Complex Lists</h2>
  <p>Lists are a key part of Markdown. Here's a test:</p>
  <ul>
    <li><p>First unordered item.</p></li>
    <li><p>Second unordered item with a nested ordered list:</p>
      <ol start="5">
        <li>Starts at number 5.</li>
        <li>And continues to 6.</li>
      </ol>
    </li>
    <li><p>A final item containing a task list:</p>
      <ul>
        <li><input type="checkbox" disabled> An incomplete task</li>
        <li><input type="checkbox" disabled checked> A completed task</li>
      </ul>
    </li>
  </ul>

  <h2>Blockquotes and Code Blocks</h2>
  <blockquote>
    <p>This is a blockquote. It's used for quoting text from other sources.</p>
    <blockquote><p>This is a nested blockquote.</p></blockquote>
  </blockquote>

  <p>And here is a fenced code block with a language specified:</p>
  <pre><code class="language-js">// A JavaScript code example
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}</code></pre>

  <h2>GitHub Flavored Markdown: Tables</h2>
  <p>Finally, a table, which requires the GFM plugin.</p>
  <table>
    <thead>
      <tr>
        <th align="left">Left-Aligned</th>
        <th align="center">Center-Aligned</th>
        <th align="right">Right-Aligned</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Content</td>
        <td>Content</td>
        <td>Content</td>
      </tr>
      <tr>
        <td>More</td>
        <td>More</td>
        <td>More</td>
      </tr>
    </tbody>
  </table>
</div>
`;

html = `
AAA
<div id="my-content">
  <h1>Project Summary</h1>
  <p>This is the first paragraph. It <strike>provides</strike> a general overview of the project and its main goals.</p>
  <p>This is the second paragraph.<br>It contains <i>a hard line break</i> to separate <b>ideas</b> within the same block.</p>
  <h2>Key Features</h2>
  <ul>
    <li><p><strong>User Authentication:</strong> Secure login and registration.</p></li>
    <li><p><strong>Data Processing:</strong>
      <ul>
        <li>Batch processing for large files.</li>
        <li>Real-time analytics stream.</li>
      </ul>
    </p></li>
    <li><p><strong>API Integration:</strong> Connects with external services.</p></li>
  </ul>
</div>
BBB
`;

html = `
<div id="my-content">
  <h1>Project Summary</h1>
  <div>
    This is the first paragraph. It <strike>provides</strike> a general overview of the project and its main goals.
    <ms-katex _ngcontent-ng-c4063671643="" _nghost-ng-c1634742780="" class="inline ng-star-inserted">
      <pre _ngcontent-ng-c1634742780="">
        <code _ngcontent-ng-c1634742780="" class="rendered">
          <span class="katex">
            <span class="katex-mathml">
              <math xmlns="http://www.w3.org/1998/Math/MathML">
                <semantics>
                  <mrow><mi mathvariant="bold">X</mi></mrow>
                  <annotation encoding="application/x-tex">\\mathbf{X}</annotation>
                </semantics>
              </math>
            </span>
          </span>
        </code>
      </pre>
    </ms-katex>
  </div>
  <h2>Key Features</h2>
  <div>
    This is the second paragraph.<br>It contains <i>a hard line break</i> to separate <b>ideas</b> within the same block.
    <ms-katex _ngcontent-ng-c4063671643="" _nghost-ng-c1634742780="" class="display ng-star-inserted">
      <pre _ngcontent-ng-c1634742780="">
        <code _ngcontent-ng-c1634742780="" class="rendered">
          <span class="katex-display">
            <span class="katex">
              <span class="katex-mathml">
                <math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
                  <semantics>
                    <mrow>
                      <mi mathvariant="bold">Q</mi>
                      <mo>=</mo>
                      <mi mathvariant="bold">X</mi>
                      <msub>
                        <mi mathvariant="bold">W</mi>
                        <mi>q</mi>
                      </msub>
                    </mrow>
                    <annotation encoding="application/x-tex">\\mathbf{Q} = \\mathbf{X} \\mathbf{W}_q</annotation>
                  </semantics>
                </math>
              </span>
              <span class="katex-html" aria-hidden="true">
                <span class="base">
                  <span class="strut" style="height: 0.8805em; vertical-align: -0.1944em"></span>
                  <span class="mord mathbf">Q</span>
                  <span class="mspace" style="margin-right: 0.2778em"></span>
                  <span class="mrel">=</span>
                  <span class="mspace" style="margin-right: 0.2778em"></span>
                </span>
                <span class="base">
                  <span class="strut" style="height: 0.9722em; vertical-align: -0.2861em"></span>
                  <span class="mord mathbf">X</span>
                  <span class="mord">
                    <span class="mord mathbf" style="margin-right: 0.016em">W</span>
                    <span class="msupsub">
                      <span class="vlist-t vlist-t2">
                        <span class="vlist-r">
                          <span class="vlist" style="height: 0.1514em">
                            <span class="" style="top: -2.55em; margin-left: -0.016em; margin-right: 0.05em">
                              <span class="pstrut" style="height: 2.7em"></span>
                              <span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right: 0.0359em">q</span></span>
                            </span>
                          </span>
                          <span class="vlist-s">&ZeroWidthSpace;</span>
                        </span>
                        <span class="vlist-r">
                          <span class="vlist" style="height: 0.2861em"><span class=""></span></span>
                        </span>
                      </span>
                    </span>
                  </span>
                </span>
              </span>
            </span>
          </span>
        </code>
      </pre>
    </ms-katex>
  </div>
</div>
`;


const document = new JSDOM('', { contentType: 'text/html' }).window.document;
const docfrag = JSDOM.fragment(html);
html = convert_documentFragment_to_htmlStr(document, docfrag);
// console.log(html);
let markdown = turndownServiceMain.turndown(html);
// markdown = await prettier.format(markdown, { parser: 'markdown' });
markdown = await prettier.format(markdown, { parser: 'markdown', plugins: [parserMarkdown] });
console.log(markdown);
