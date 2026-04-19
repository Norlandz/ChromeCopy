import { run_conversion } from '../support/tester';
import { GoogleAIStudioAdapter } from '../../platforms/GoogleAIStudioAdapter';

/**
 * TEST CASE: MACRO DICE DISPLAY MATH
 * ----------------------------
 * Verifies that large, multi-line display math blocks are correctly
 * identified and wrapped in $$ delimiters.
 */

const html = String.raw`
<ms-katex class="display">
  <pre>
    <code class="rendered">
      <span class="katex-display">
        <span class="katex">
          <span class="katex-mathml">
            <math display="block">
              <semantics>
                <mrow><msub><mi mathvariant="script">L</mi><mtext>MacroDice</mtext></msub><mo>=</mo><mn>1</mn><mo>−</mo><mn>...</mn></mrow>
                <annotation encoding="application/x-tex">\mathcal{L}_{\text{MacroDice}} = 1 - \frac{1}{|\mathcal{C}|} \sum_{c \in \mathcal{C}} DSC_c = 1 - \frac{1}{|\mathcal{C}|} \sum_{c \in \mathcal{C}} \left( \frac{2 \sum_i t_{ci} p_{ci} + \epsilon}{\sum_i t_{ci} + \sum_i p_{ci} + \epsilon} \right)</annotation>
              </semantics>
            </math>
          </span>
        </span>
      </span>
    </code>
  </pre>
</ms-katex>
`.trim();

const adapter = new GoogleAIStudioAdapter();
const url = 'https://aistudio.google.com/';

const markdown = run_conversion(html, adapter, url);

console.log(markdown);
