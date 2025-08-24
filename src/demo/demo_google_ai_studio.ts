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

html = `
AA
                    <div role="region" class="mat-expansion-panel-content" id="cdk-accordion-child-35" aria-labelledby="mat-expansion-panel-header-35">
                      <div class="mat-expansion-panel-body">
                        <ms-code-block _ngcontent-ng-c4063671643="" _nghost-ng-c3391995116="">
                          <div _ngcontent-ng-c3391995116="" class="syntax-highlighted-code-wrapper">
                            <div _ngcontent-ng-c3391995116="" class="syntax-highlighted-code">
                              <pre _ngcontent-ng-c3391995116="">      <code _ngcontent-ng-c3391995116=""><span class="hljs-comment"># Our data from the previous step</span>
probabilities = np.array([<span class="hljs-number">0.0246</span>, <span class="hljs-number">0.052</span>, ..., <span class="hljs-number">0.0763</span>, ...]) <span class="hljs-comment"># Shape (60,)</span>
target_token_id = <span class="hljs-number">12</span>

<span class="hljs-comment"># Create the one-hot target vector</span>
y = np.zeros_like(probabilities)
y[target_token_id] = <span class="hljs-number">1</span>

<span class="hljs-comment"># Calculate the gradient</span>
gradient_logits = probabilities - y

print(<span class="hljs-string">"Shape of gradient vector:"</span>, gradient_logits.shape)
print(<span class="hljs-string">f"Gradient for an incorrect token (e.g., index 1): <span class="hljs-subst">{gradient_logits[<span class="hljs-number">1</span>]:<span class="hljs-number">.4</span>f}</span>"</span>)
print(<span class="hljs-string">f"This is just p_1 (<span class="hljs-subst">{probabilities[<span class="hljs-number">1</span>]:<span class="hljs-number">.4</span>f}</span>) - y_1 (0)"</span>)

print(<span class="hljs-string">f"\nGradient for the correct token (index 12): <span class="hljs-subst">{gradient_logits[<span class="hljs-number">12</span>]:<span class="hljs-number">.4</span>f}</span>"</span>)
print(<span class="hljs-string">f"This is p_12 (<span class="hljs-subst">{probabilities[<span class="hljs-number">12</span>]:<span class="hljs-number">.4</span>f}</span>) - y_12 (1)"</span>)</code>
    </pre>
                            </div>
                            <div _ngcontent-ng-c3391995116="" aria-hidden="true" class="ignore-when-copying ng-star-inserted">IGNORE_WHEN_COPYING_START</div>
                            <footer _ngcontent-ng-c3391995116="" class="gmat-body-medium ng-star-inserted">
                              <div _ngcontent-ng-c3391995116="" class="actions">
                                <button
                                  _ngcontent-ng-c3391995116=""
                                  mat-icon-button=""
                                  mattooltip="Copy to clipboard"
                                  class="mdc-icon-button mat-mdc-icon-button mat-mdc-button-base mat-mdc-tooltip-trigger mat-unthemed _mat-animation-noopable"
                                  mat-ripple-loader-uninitialized=""
                                  mat-ripple-loader-class-name="mat-mdc-button-ripple"
                                  mat-ripple-loader-centered=""
                                  aria-describedby="cdk-describedby-message-ng-1-45"
                                  cdk-describedby-host="ng-1"
                                >
                                  <span class="mat-mdc-button-persistent-ripple mdc-icon-button__ripple"></span>
                                  <span _ngcontent-ng-c3391995116="" aria-hidden="true" class="material-symbols-outlined notranslate">content_copy</span>
                                  <span class="mat-focus-indicator"></span>
                                  <span class="mat-mdc-button-touch-target"></span>
                                </button>
                                <!---->
                                <button
                                  _ngcontent-ng-c3391995116=""
                                  mat-icon-button=""
                                  mattooltip="Download"
                                  class="mdc-icon-button mat-mdc-icon-button mat-mdc-button-base mat-mdc-tooltip-trigger mat-unthemed _mat-animation-noopable"
                                  mat-ripple-loader-uninitialized=""
                                  mat-ripple-loader-class-name="mat-mdc-button-ripple"
                                  mat-ripple-loader-centered=""
                                  aria-describedby="cdk-describedby-message-ng-1-46"
                                  cdk-describedby-host="ng-1"
                                >
                                  <span class="mat-mdc-button-persistent-ripple mdc-icon-button__ripple"></span>
                                  <span _ngcontent-ng-c3391995116="" aria-hidden="true" class="material-symbols-outlined notranslate">download</span>
                                  <span class="mat-focus-indicator"></span>
                                  <span class="mat-mdc-button-touch-target"></span>
                                </button>
                                <!---->
                              </div>
                              <span _ngcontent-ng-c3391995116="" class="disclaimer">
                                <bdo _ngcontent-ng-c3391995116="" dir="ltr">
                                  Use code
                                  <a _ngcontent-ng-c3391995116="" href="https://support.google.com/legal/answer/13505487" target="_blank">with caution</a>
                                  .
                                </bdo>
                              </span>
                              <span _ngcontent-ng-c3391995116="" class="spacer"></span>
                              <span _ngcontent-ng-c3391995116="" class="language">Python</span>
                            </footer>
                            <div _ngcontent-ng-c3391995116="" aria-hidden="true" class="ignore-when-copying ng-star-inserted">IGNORE_WHEN_COPYING_END</div>
                            <!---->
                            <!---->
                          </div>
                        </ms-code-block>
                        <!---->
                      </div>
                    </div>
`;

// // @pb[<pre> inside <p> shadow dom parsing problem]
// html = `
// <p _ngcontent-ng-c4063671643="" class="ng-star-inserted">
//   <ms-cmark-node _ngcontent-ng-c4063671643="" _nghost-ng-c4063671643="">
//     <!---->
//     <ms-katex _ngcontent-ng-c4063671643="" _nghost-ng-c1938781="" class="inline ng-star-inserted">
//       <pre _ngcontent-ng-c1938781="">
//         <code _ngcontent-ng-c1938781="" class="rendered"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>L</mi><mo>=</mo><mo>−</mo><msubsup><mo>∑</mo><mrow><mi>i</mi><mo>=</mo><mn>1</mn></mrow><mi>C</mi></msubsup><msub><mi>y</mi><mi>i</mi></msub><mi>log</mi><mo>⁡</mo><mo stretchy="false">(</mo><msub><mi>p</mi><mi>i</mi></msub><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">L = -\sum_{i=1}^{C} y_i \log(p_i)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height: 0.6833em;"></span><span class="mord mathnormal">L</span><span class="mspace" style="margin-right: 0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right: 0.2778em;"></span></span><span class="base"><span class="strut" style="height: 1.2809em; vertical-align: -0.2997em;"></span><span class="mord">−</span><span class="mspace" style="margin-right: 0.1667em;"></span><span class="mop"><span class="mop op-symbol small-op" style="position: relative; top: 0em;">∑</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height: 0.9812em;"><span class="" style="top: -2.4003em; margin-left: 0em; margin-right: 0.05em;"><span class="pstrut" style="height: 2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span class="" style="top: -3.2029em; margin-right: 0.05em;"><span class="pstrut" style="height: 2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right: 0.0715em;">C</span></span></span></span></span><span class="vlist-s">&ZeroWidthSpace;</span></span><span class="vlist-r"><span class="vlist" style="height: 0.2997em;"><span class=""></span></span></span></span></span></span><span class="mspace" style="margin-right: 0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right: 0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height: 0.3117em;"><span class="" style="top: -2.55em; margin-left: -0.0359em; margin-right: 0.05em;"><span class="pstrut" style="height: 2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">&ZeroWidthSpace;</span></span><span class="vlist-r"><span class="vlist" style="height: 0.15em;"><span class=""></span></span></span></span></span></span><span class="mspace" style="margin-right: 0.1667em;"></span><span class="mop">lo<span style="margin-right: 0.0139em;">g</span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">p</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height: 0.3117em;"><span class="" style="top: -2.55em; margin-left: 0em; margin-right: 0.05em;"><span class="pstrut" style="height: 2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">&ZeroWidthSpace;</span></span><span class="vlist-r"><span class="vlist" style="height: 0.15em;"><span class=""></span></span></span></span></span></span><span class="mclose">)</span></span></span></span></code>
//       </pre>
//     </ms-katex>
//     <!---->
//   </ms-cmark-node>
// </p>
// `;

html = `
<my-tag>
  AAA
  <pre>    <code class="language-python">111
target_token_id = <span class="hljs-number">12</span>
333</code>
</pre>
  BBB
</my-tag>
`


html = `
<ms-code-block><pre>      <code><span class="hljs-comment"># Our data from the previous step</span>
target_token_id = <span class="hljs-number">12</span>
y[target_token_id] = <span class="hljs-number">1</span>
</code></pre>
</ms-code-block>
`;


const document = new JSDOM('', { contentType: 'text/html' }).window.document;
const docfrag = JSDOM.fragment(html);
html = convert_documentFragment_to_htmlStr(document, docfrag);
console.log(html);
let markdown = turndownServiceMain.turndown(html);
// markdown = await prettier.format(markdown, { parser: 'markdown' });
markdown = await prettier.format(markdown, { parser: 'markdown', plugins: [parserMarkdown] });
console.log(markdown);
