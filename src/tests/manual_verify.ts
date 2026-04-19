import { JSDOM } from 'jsdom';
import { MarkdownConverter } from '../core/MarkdownConverter';
import { GoogleAIStudioAdapter } from '../platforms/GoogleAIStudioAdapter';

/**
 * MANUAL CORE LOGIC VERIFICATION
 * ----------------------------
 * This script provides a minimal Node.js environment with JSDOM
 * to verify conversion logic without the overhead of the extension.
 */

// 1. Setup specialized environment context
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
const { window } = dom;

// Assign globals that the core logic expects
global.document = window.document;
global.Node = window.Node as any;
global.Element = window.Element as any;
global.DocumentFragment = window.DocumentFragment as any;
global.HTMLElement = window.HTMLElement as any;

function run_test() {
  const converter = new MarkdownConverter();
  converter.registerAdapter(new GoogleAIStudioAdapter());

  // --- REAL-WORLD SNIPPET (From demo5.html) ---
  const html = `
<ms-cmark-node>
  <span class="ng-star-inserted">Each patch is a 3D volume: </span>
  <ms-katex class="inline">
    <pre><code class="rendered"><span class="katex"><span class="katex-mathml"><math><semantics><mrow><mn>16</mn><mo>×</mo><mn>16</mn></mrow><annotation encoding="application/x-tex">16 \times 16</annotation></semantics></math></span></span></code></pre>
  </ms-katex>
  <span class="ng-star-inserted">. Proceeding...</span>
</ms-cmark-node>
  `.trim();

  // 2. Prepare the DocumentFragment
  const container = document.createElement('div');
  container.innerHTML = html;
  const fragment = document.createDocumentFragment();
  while (container.firstChild) {
    fragment.appendChild(container.firstChild);
  }

  // 3. Perform conversion
  const testUrl = 'https://aistudio.google.com/';
  const markdown = converter.convert(fragment, testUrl);

  // 4. Output Result
  console.log('\n--- CORE VERIFICATION (PROD DATA) ---');
  console.log(markdown);
  console.log('--------------------------------------\n');
}

run_test();
