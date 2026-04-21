import { run_conversion } from '../support/tester';
import { GoogleAIStudioAdapter } from '../../platforms/GoogleAIStudioAdapter';

/**
 * TEST CASE: NESTED LIST MATH
 * ----------------------------
 * Verifies that inline math inside deeply nested list structures
 * is correctly identified and wrapped in $ delimiters.
 */

const html = String.raw`
<ul class="ng-star-inserted">
  <li class="ng-star-inserted">
    <ms-cmark-node>
      <p class="ng-star-inserted">
        <ms-cmark-node>
          <ms-katex class="inline">
            <pre><code class="rendered"><span class="katex"><span class="katex-mathml"><math><semantics><mrow><mi>c</mi><mo>∈</mo><mi mathvariant="script">C</mi></mrow><annotation encoding="application/x-tex">c \in \mathcal{C}</annotation></semantics></math></span></span></code></pre>
          </ms-katex>
          <span>iterates through the set of classes you care about.</span>
        </ms-cmark-node>
      </p>
    </ms-cmark-node>
  </li>
</ul>
`.trim();

const adapter = new GoogleAIStudioAdapter();
const url = 'https://aistudio.google.com/';

const markdown = run_conversion(html, adapter, url);

console.log(markdown);
