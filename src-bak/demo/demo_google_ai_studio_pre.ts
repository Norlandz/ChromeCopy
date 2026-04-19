import prettier from 'prettier';
import parserMarkdown from 'prettier/plugins/markdown';
import { JSDOM } from 'jsdom';
import { convert_documentFragment_to_htmlStr } from '../contentScript/html_convertor';
import { turndownServiceMain } from '../contentScript/turndown_service_main';
import { convert_xmlStr_to_documentFragment } from './html_convertor_jsdom';

let html = '';

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
// console.log(html);
let markdown = turndownServiceMain.turndown(html);
// markdown = await prettier.format(markdown, { parser: 'markdown' });
markdown = await prettier.format(markdown, { parser: 'markdown', plugins: [parserMarkdown] });
console.log(markdown);
