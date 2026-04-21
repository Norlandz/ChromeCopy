import { run_conversion } from '../support/tester';
import { GoogleAIStudioAdapter } from '../../platforms/GoogleAIStudioAdapter';

/**
 * TEST CASE: BOLD WRAPPED MATH
 * ----------------------------
 * Verifies that math nodes inside bold/strong tags are correctly
 * processed without losing the bold formatting or corrupting the math.
 */

const html = String.raw`
<ms-cmark-node>
  <p>
    <strong>
      <ms-cmark-node>
        <span class="ng-star-inserted">The Strict Transformation:</span>
      </ms-cmark-node>
    </strong>
    <ms-katex class="inline">
      <pre><code class="rendered"><span class="katex"><span class="katex-mathml"><math><semantics><mrow><mi mathvariant="bold">X</mi></mrow><annotation encoding="application/x-tex">\mathbf{X}</annotation></semantics></math></span></span></code></pre>
    </ms-katex>
  </p>
</ms-cmark-node>
`.trim();

const adapter = new GoogleAIStudioAdapter();
const url = 'https://aistudio.google.com/';

const markdown = run_conversion(html, adapter, url);

console.log(markdown);
