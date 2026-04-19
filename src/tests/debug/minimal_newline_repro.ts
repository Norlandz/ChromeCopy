import '../../tests/support/env';
import { GoogleAIStudioAdapter } from '../../platforms/GoogleAIStudioAdapter';
import { MarkdownConverter } from '../../core/MarkdownConverter';
import { JSDOM } from 'jsdom';

async function runMinimalTest() {
  const adapter = new GoogleAIStudioAdapter();
  const converter = new MarkdownConverter([adapter]);

  // Case 1: The newline after parenthesis
  const html1 = `<p class="ng-star-inserted"><span>- weights (</span><ms-katex class="inline"><div data-was-pre="true"><annotation encoding="application/x-tex">W_{qkv}</annotation></div></ms-katex>)</p>`;
  
  // Case 2: The missing formula in Step 1
  const html2 = `<p class="ng-star-inserted"><span>Values.</span><br><ms-cmark-node></ms-cmark-node><ms-katex class="display"><pre data-was-pre="true"><code><annotation encoding="application/x-tex">Q = zW_Q + b_Q</annotation></code></pre></ms-katex></p>`;

  const testCases = [
    { name: "Parenthesis Newline", html: html1 },
    { name: "Missing Formula", html: html2 }
  ];

  for (const test of testCases) {
    console.log(`\n\n--- TESTING CASE: ${test.name} ---`);
    const fragment = document.createDocumentFragment();
    const div = document.createElement('div');
    div.innerHTML = test.html;
    while(div.firstChild) fragment.appendChild(div.firstChild);

    adapter.preprocess(fragment);
    
    const wrap = document.createElement('div');
    wrap.appendChild(fragment.cloneNode(true));
    console.log("DOM AFTER PREPROCESS:", wrap.innerHTML);

    const markdown = converter.convert(test.html, 'https://aistudio.google.com/');
    console.log("FINAL MARKDOWN:");
    console.log(markdown);
  }
}

runMinimalTest().catch(console.error);
