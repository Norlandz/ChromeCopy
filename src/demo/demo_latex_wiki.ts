import prettier from 'prettier';
import parserMarkdown from 'prettier/plugins/markdown';
import { JSDOM } from 'jsdom';
import { convert_documentFragment_to_htmlStr } from '../contentScript/html_convertor';
import { turndownServiceMain } from '../contentScript/turndown_service_main';
import { convert_xmlStr_to_documentFragment } from './html_convertor_jsdom';
import { regex_indicator } from '../contentScript/regex_indicator';

let html_raw = '';

html_raw = String.raw`
<p>For a discrete (binary) ground truth <span class="mwe-math-element mwe-math-element-inline"><span class="mwe-math-mathml-inline mwe-math-mathml-a11y" style="display: none;"><math xmlns="http://www.w3.org/1998/Math/MathML" alttext="{\displaystyle A}">
  <semantics>
    <mrow class="MJX-TeXAtom-ORD">
      <mstyle displaystyle="true" scriptlevel="0">
        <mi>A</mi>
      </mstyle>
    </mrow>
    <annotation encoding="application/x-tex">{\displaystyle A}</annotation>
  </semantics>
</math></span><img src="https://wikimedia.org/api/rest_v1/media/math/render/svg/7daff47fa58cdfd29dc333def748ff5fa4c923e3" class="mwe-math-fallback-image-inline mw-invert skin-invert" aria-hidden="true" style="vertical-align: -0.338ex; width:1.743ex; height:2.176ex;" alt="{\displaystyle A}"></span> and continuous measures <span class="mwe-math-element mwe-math-element-inline"><span class="mwe-math-mathml-inline mwe-math-mathml-a11y" style="display: none;"><math xmlns="http://www.w3.org/1998/Math/MathML" alttext="{\displaystyle B}">
  <semantics>
    <mrow class="MJX-TeXAtom-ORD">
      <mstyle displaystyle="true" scriptlevel="0">
        <mi>B</mi>
      </mstyle>
    </mrow>
    <annotation encoding="application/x-tex">{\displaystyle B}</annotation>
  </semantics>
</math></span><img src="https://wikimedia.org/api/rest_v1/media/math/render/svg/47136aad860d145f75f3eed3022df827cee94d7a" class="mwe-math-fallback-image-inline mw-invert skin-invert" aria-hidden="true" style="vertical-align: -0.338ex; width:1.764ex; height:2.176ex;" alt="{\displaystyle B}"></span> in the interval [0,1], the following formula can be used:
</p>
<p><span class="mwe-math-element mwe-math-element-inline"><span class="mwe-math-mathml-inline mwe-math-mathml-a11y" style="display: none;"><math xmlns="http://www.w3.org/1998/Math/MathML" alttext="{\displaystyle cDC={\frac {2|A\cap B|}{c*|A|+|B|}}}">
  <semantics>
    <mrow class="MJX-TeXAtom-ORD">
      <mstyle displaystyle="true" scriptlevel="0">
        <mi>c</mi>
        <mi>D</mi>
        <mi>C</mi>
        <mo>=</mo>
        <mrow class="MJX-TeXAtom-ORD">
          <mfrac>
            <mrow>
              <mn>2</mn>
              <mrow class="MJX-TeXAtom-ORD">
                <mo stretchy="false">|</mo>
              </mrow>
              <mi>A</mi>
              <mo>∩<!-- ∩ --></mo>
              <mi>B</mi>
              <mrow class="MJX-TeXAtom-ORD">
                <mo stretchy="false">|</mo>
              </mrow>
            </mrow>
            <mrow>
              <mi>c</mi>
              <mo>∗<!-- ∗ --></mo>
              <mrow class="MJX-TeXAtom-ORD">
                <mo stretchy="false">|</mo>
              </mrow>
              <mi>A</mi>
              <mrow class="MJX-TeXAtom-ORD">
                <mo stretchy="false">|</mo>
              </mrow>
              <mo>+</mo>
              <mrow class="MJX-TeXAtom-ORD">
                <mo stretchy="false">|</mo>
              </mrow>
              <mi>B</mi>
              <mrow class="MJX-TeXAtom-ORD">
                <mo stretchy="false">|</mo>
              </mrow>
            </mrow>
          </mfrac>
        </mrow>
      </mstyle>
    </mrow>
    <annotation encoding="application/x-tex">{\displaystyle cDC={\frac {2|A\cap B|}{c*|A|+|B|}}}</annotation>
  </semantics>
</math></span><img src="https://wikimedia.org/api/rest_v1/media/math/render/svg/902d43e9195413dd829af4898ade912a393ef683" class="mwe-math-fallback-image-inline mw-invert skin-invert" aria-hidden="true" style="vertical-align: -2.671ex; width:20.768ex; height:6.509ex;" alt="{\displaystyle cDC={\frac {2|A\cap B|}{c*|A|+|B|}}}"></span>
</p>
<p>Where <span class="mwe-math-element mwe-math-element-inline"><span class="mwe-math-mathml-inline mwe-math-mathml-a11y" style="display: none;"><math xmlns="http://www.w3.org/1998/Math/MathML" alttext="{\displaystyle |A\cap B|=\Sigma _{i}a_{i}b_{i}}">
  <semantics>
    <mrow class="MJX-TeXAtom-ORD">
      <mstyle displaystyle="true" scriptlevel="0">
        <mrow class="MJX-TeXAtom-ORD">
          <mo stretchy="false">|</mo>
        </mrow>
        <mi>A</mi>
        <mo>∩<!-- ∩ --></mo>
        <mi>B</mi>
        <mrow class="MJX-TeXAtom-ORD">
          <mo stretchy="false">|</mo>
        </mrow>
        <mo>=</mo>
        <msub>
          <mi mathvariant="normal">Σ<!-- Σ --></mi>
          <mrow class="MJX-TeXAtom-ORD">
            <mi>i</mi>
          </mrow>
        </msub>
        <msub>
          <mi>a</mi>
          <mrow class="MJX-TeXAtom-ORD">
            <mi>i</mi>
          </mrow>
        </msub>
        <msub>
          <mi>b</mi>
          <mrow class="MJX-TeXAtom-ORD">
            <mi>i</mi>
          </mrow>
        </msub>
      </mstyle>
    </mrow>
    <annotation encoding="application/x-tex">{\displaystyle |A\cap B|=\Sigma _{i}a_{i}b_{i}}</annotation>
  </semantics>
</math></span><img src="https://wikimedia.org/api/rest_v1/media/math/render/svg/ea7df77f8c373b8334d5357cf4b53466c7b81e7e" class="mwe-math-fallback-image-inline mw-invert skin-invert" aria-hidden="true" style="vertical-align: -0.838ex; width:16.786ex; height:2.843ex;" alt="{\displaystyle |A\cap B|=\Sigma _{i}a_{i}b_{i}}"></span> and <span class="mwe-math-element mwe-math-element-inline"><span class="mwe-math-mathml-inline mwe-math-mathml-a11y" style="display: none;"><math xmlns="http://www.w3.org/1998/Math/MathML" alttext="{\displaystyle |B|=\Sigma _{i}b_{i}}">
  <semantics>
    <mrow class="MJX-TeXAtom-ORD">
      <mstyle displaystyle="true" scriptlevel="0">
        <mrow class="MJX-TeXAtom-ORD">
          <mo stretchy="false">|</mo>
        </mrow>
        <mi>B</mi>
        <mrow class="MJX-TeXAtom-ORD">
          <mo stretchy="false">|</mo>
        </mrow>
        <mo>=</mo>
        <msub>
          <mi mathvariant="normal">Σ<!-- Σ --></mi>
          <mrow class="MJX-TeXAtom-ORD">
            <mi>i</mi>
          </mrow>
        </msub>
        <msub>
          <mi>b</mi>
          <mrow class="MJX-TeXAtom-ORD">
            <mi>i</mi>
          </mrow>
        </msub>
      </mstyle>
    </mrow>
    <annotation encoding="application/x-tex">{\displaystyle |B|=\Sigma _{i}b_{i}}</annotation>
  </semantics>
</math></span><img src="https://wikimedia.org/api/rest_v1/media/math/render/svg/8a8acac320a11aed784cc3659cda35fdf87a7c03" class="mwe-math-fallback-image-inline mw-invert skin-invert" aria-hidden="true" style="vertical-align: -0.838ex; width:10.431ex; height:2.843ex;" alt="{\displaystyle |B|=\Sigma _{i}b_{i}}"></span>
</p>
<p>c can be computed as follows:
</p>
<p><span class="mwe-math-element mwe-math-element-inline"><span class="mwe-math-mathml-inline mwe-math-mathml-a11y" style="display: none;"><math xmlns="http://www.w3.org/1998/Math/MathML" alttext="{\displaystyle c={\frac {\Sigma _{i}a_{i}b_{i}}{\Sigma _{i}a_{i}\operatorname {sign} {(b_{i})}}}}">
  <semantics>
    <mrow class="MJX-TeXAtom-ORD">
      <mstyle displaystyle="true" scriptlevel="0">
        <mi>c</mi>
        <mo>=</mo>
        <mrow class="MJX-TeXAtom-ORD">
          <mfrac>
            <mrow>
              <msub>
                <mi mathvariant="normal">Σ<!-- Σ --></mi>
                <mrow class="MJX-TeXAtom-ORD">
                  <mi>i</mi>
                </mrow>
              </msub>
              <msub>
                <mi>a</mi>
                <mrow class="MJX-TeXAtom-ORD">
                  <mi>i</mi>
                </mrow>
              </msub>
              <msub>
                <mi>b</mi>
                <mrow class="MJX-TeXAtom-ORD">
                  <mi>i</mi>
                </mrow>
              </msub>
            </mrow>
            <mrow>
              <msub>
                <mi mathvariant="normal">Σ<!-- Σ --></mi>
                <mrow class="MJX-TeXAtom-ORD">
                  <mi>i</mi>
                </mrow>
              </msub>
              <msub>
                <mi>a</mi>
                <mrow class="MJX-TeXAtom-ORD">
                  <mi>i</mi>
                </mrow>
              </msub>
              <mi>sign</mi>
              <mo>⁡<!-- ⁡ --></mo>
              <mrow class="MJX-TeXAtom-ORD">
                <mo stretchy="false">(</mo>
                <msub>
                  <mi>b</mi>
                  <mrow class="MJX-TeXAtom-ORD">
                    <mi>i</mi>
                  </mrow>
                </msub>
                <mo stretchy="false">)</mo>
              </mrow>
            </mrow>
          </mfrac>
        </mrow>
      </mstyle>
    </mrow>
    <annotation encoding="application/x-tex">{\displaystyle c={\frac {\Sigma _{i}a_{i}b_{i}}{\Sigma _{i}a_{i}\operatorname {sign} {(b_{i})}}}}</annotation>
  </semantics>
</math></span><img src="https://wikimedia.org/api/rest_v1/media/math/render/svg/c00841fe7e10ffa112d72388242135181c7d880e" class="mwe-math-fallback-image-inline mw-invert skin-invert" aria-hidden="true" style="vertical-align: -2.671ex; width:17.847ex; height:6.176ex;" alt="{\displaystyle c={\frac {\Sigma _{i}a_{i}b_{i}}{\Sigma _{i}a_{i}\operatorname {sign} {(b_{i})}}}}"></span>
</p>
`;

const dom = new JSDOM('', { contentType: 'text/html' });
const document = dom.window.document;
const docfrag = JSDOM.fragment(html_raw);
const html = convert_documentFragment_to_htmlStr(document, docfrag);
// console.log(html);
// console.log('---')
let markdown = turndownServiceMain.turndown(html);
// markdown = await prettier.format(markdown, { parser: 'markdown' });
// console.log(markdown);
markdown = markdown.replaceAll(regex_indicator.code_block_beginning, '');
markdown = await prettier.format(markdown, { parser: 'markdown', plugins: [parserMarkdown] });
console.log(markdown);
