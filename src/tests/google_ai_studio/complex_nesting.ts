import { run_conversion } from '../support/tester';
import { GoogleAIStudioAdapter } from '../../platforms/GoogleAIStudioAdapter';

/**
 * TEST CASE: COMPLEX NESTED STRUCTURE (PRODUCTION CLONE)
 * -----------------------------------
 * Cloned from src-bak/demo/google_ai_studio/demo4.html
 * Verifies handling of deep Angular nesting: ms-cmark-node > strong > ms-cmark-node > ms-katex
 */

const html = String.raw`
<ms-cmark-node class="cmark-node v3-font-body ng-star-inserted">
  <ul class="ng-star-inserted">
    <ms-cmark-node>
      <li class="ng-star-inserted">
        <ms-cmark-node>
          <p class="ng-star-inserted">
            <ms-cmark-node>
              <strong class="ng-star-inserted">
                <ms-cmark-node>
                  <span class="ng-star-inserted">Image Dimension (</span>
                  <ms-katex class="inline ng-star-inserted">
                    <pre>
                      <code class="rendered">
                        <span class="katex">
                          <span class="katex-mathml">
                            <math><semantics><mrow><mi>H</mi><mo>×</mo><mi>W</mi><mo>×</mo><mi>C</mi></mrow><annotation encoding="application/x-tex">H \times W \times C</annotation></semantics></math>
                          </span>
                        </span>
                      </code>
                    </pre>
                  </ms-katex>
                  <span class="ng-star-inserted">):</span>
                </ms-cmark-node>
              </strong>
            </ms-cmark-node>
          </p>
        </ms-cmark-node>
      </li>
    </ms-cmark-node>
  </ul>
</ms-cmark-node>
`.trim();

const adapter = new GoogleAIStudioAdapter();
const url = 'https://aistudio.google.com/';

const markdown = run_conversion(html, adapter, url);

console.log(markdown);
