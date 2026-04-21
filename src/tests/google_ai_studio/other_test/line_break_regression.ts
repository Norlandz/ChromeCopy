import { run_conversion } from '@/tests/support/tester';
import { GoogleAIStudioAdapter } from '@/platforms/GoogleAIStudioAdapter';

/**
 * TEST CASE: LINE BREAK REGRESSION (DSC_c)
 * ---------------------------------------
 * Verifies that inline math doesn't introduce unwanted newlines
 * or "weird line breaks" as noted in legacy TODOs.
 */

const html = String.raw`
<ms-cmark-node>
  <p>
    <span class="ng-star-inserted">The inner fraction is the Dice score for a single class,</span>
    <ms-katex class="inline">
      <pre><code class="rendered"><span class="katex"><span class="katex-mathml"><math><semantics><mrow><mi>D</mi><mi>S</mi><msub><mi>C</mi><mi>c</mi></msub></mrow><annotation encoding="application/x-tex">DSC_c</annotation></semantics></math></span></span></code></pre>
    </ms-katex>
    <span class="ng-star-inserted">.</span>
  </p>
</ms-cmark-node>
`.trim();

const adapter = new GoogleAIStudioAdapter();
const url = 'https://aistudio.google.com/';

const markdown = run_conversion(html, adapter, url);

console.log(markdown);
