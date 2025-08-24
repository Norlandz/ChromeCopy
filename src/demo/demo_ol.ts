import prettier from 'prettier';
import parserMarkdown from 'prettier/plugins/markdown';
import { JSDOM } from 'jsdom';
import { convert_documentFragment_to_htmlStr } from '../contentScript/html_convertor';
import { turndownServiceMain } from '../contentScript/turndown_service_main';
import { convert_xmlStr_to_documentFragment } from './html_convertor_jsdom';
import { regex_indicator } from '../contentScript/regex_indicator';

let html = '';

html = `<h3><span>The Main Approaches: A Breakdown</span></h3>
<p>
  <span>
    Let's re-frame your options into the standard terminology used in the field.
  </span>
</p>
<h4><span>1. Proposal-Based (Detect-then-Segment)</span></h4>
<p>
  <span>
    This is what your idea of a "multi-task model including detecting the bbox"
    falls into. It's a two-stage process:
  </span>
</p>
<ol>
  <li>
    <p>
      <strong><span>Detection Stage:</span></strong>
      <span>
        First, find the bounding boxes of all objects in the image. A Region
        Proposal Network (RPN) or a similar detector does this. It also
        classifies each box (e.g., "this box is a car").
      </span>
    </p>
  </li>
  <li>
    <p>
      <strong><span>Segmentation Stage:</span></strong>
      <span>
        For each proposed bounding box, run a smaller segmentation model (a
        "mask head") to generate a pixel-perfect mask
      </span>
      <i style="font-style: italic;"><span>only within that box</span></i>
      <span>.</span>
    </p>
  </li>
</ol>
<ul>
  <li>
    <p>
      <strong><span>Famous Architecture:</span></strong>
      <span></span>
      <strong><span>Mask R-CNN</span></strong>
      <span>is the undisputed king and poster child of this approach.</span>
    </p>
  </li>
  <li>
    <p>
      <strong><span>How it Works:</span></strong>
      <span>
        It's essentially a Faster R-CNN (for object detection) with an
        additional branch for predicting segmentation masks.
      </span>
    </p>
  </li>
  <li>
    <p>
      <strong><span>Pros:</span></strong>
    </p>
    <ul>
      <li>
        <p>
          <strong><span>Highest Accuracy:</span></strong>
          <span>
            This is generally the most accurate and robust approach, especially
            for complex scenes with many overlapping objects. It's the go-to
            benchmark for research.
          </span>
        </p>
      </li>
      <li>
        <p>
          <strong><span>Rich Output:</span></strong>
          <span>
            You get everything: class labels, bounding boxes, and instance
            masks.
          </span>
        </p>
      </li>
    </ul>
  </li>
  <li>
    <p>
      <strong><span>Cons:</span></strong>
    </p>
    <ul>
      <li>
        <p>
          <strong><span>Slow:</span></strong>
          <span>
            The two-stage process makes it computationally expensive and slower
            than other methods. It's often not suitable for real-time
            applications without significant hardware.
          </span>
        </p>
      </li>
    </ul>
  </li>
</ul>
<h4><span>2. Proposal-Free (Single-Shot)</span></h4>
<p>
  <span>
    These methods try to do everything at once in a single pass, making them
    much faster.
  </span>
</p>
<ul>
  <li>
    <p>
      <strong><span>Famous Architectures:</span></strong>
      <span></span>
      <strong><span>YOLACT</span></strong>
      <span>(You Only Look At CoefficienTs),</span>
      <strong><span>SOLOv2</span></strong>
      <span>,</span>
      <strong><span>Mask2Former</span></strong>
      <span>.</span>
    </p>
  </li>
  <li>
    <p>
      <strong><span>How it Works (YOLACT example):</span></strong>
    </p>
    <ol>
      <li>
        <p>
          <span>
            A feature pyramid network (like in UNet or other modern
            architectures) generates high-quality feature maps.
          </span>
        </p>
      </li>
      <li>
        <p>
          <span>
            One branch of the network generates a set of "prototype" masks for
            the entire image that are not tied to any specific instance.
          </span>
        </p>
      </li>
    </ol>
  </li>
</ul>
`;

html = `
<ol _ngcontent-ng-c2940963938="" class="ng-star-inserted">
  <ms-cmark-node _ngcontent-ng-c2940963938="" _nghost-ng-c2940963938="">
    <li _ngcontent-ng-c2940963938="" class="ng-star-inserted">
      <ms-cmark-node _ngcontent-ng-c2940963938="" _nghost-ng-c2940963938="">
        <p _ngcontent-ng-c2940963938="" class="ng-star-inserted">
          <ms-cmark-node _ngcontent-ng-c2940963938="" _nghost-ng-c2940963938="">
            <strong _ngcontent-ng-c2940963938="" class="ng-star-inserted">
              <ms-cmark-node _ngcontent-ng-c2940963938="" _nghost-ng-c2940963938="">
                <span _ngcontent-ng-c2940963938="" class="ng-star-inserted">Detection Stage:</span>
              </ms-cmark-node>
            </strong>

            <span _ngcontent-ng-c2940963938="" class="ng-star-inserted">
              First, find the bounding boxes of all objects in the image. A Region Proposal Network (RPN) or a similar detector does this. It also classifies each box (e.g., "this box is a car").
            </span>
          </ms-cmark-node>
        </p>
      </ms-cmark-node>
    </li>

    <li _ngcontent-ng-c2940963938="" class="ng-star-inserted">
      <ms-cmark-node _ngcontent-ng-c2940963938="" _nghost-ng-c2940963938="">
        <p _ngcontent-ng-c2940963938="" class="ng-star-inserted">
          <ms-cmark-node _ngcontent-ng-c2940963938="" _nghost-ng-c2940963938="">
            <strong _ngcontent-ng-c2940963938="" class="ng-star-inserted">
              <ms-cmark-node _ngcontent-ng-c2940963938="" _nghost-ng-c2940963938="">
                <span _ngcontent-ng-c2940963938="" class="ng-star-inserted">Segmentation Stage:</span>
              </ms-cmark-node>
            </strong>

            <span _ngcontent-ng-c2940963938="" class="ng-star-inserted">For each proposed bounding box, run a smaller segmentation model (a "mask head") to generate a pixel-perfect mask</span>

            <i _ngcontent-ng-c2940963938="" style="font-style: italic" class="ng-star-inserted">
              <ms-cmark-node _ngcontent-ng-c2940963938="" _nghost-ng-c2940963938="">
                <span _ngcontent-ng-c2940963938="" class="ng-star-inserted">only within that box</span>
              </ms-cmark-node>
            </i>

            <span _ngcontent-ng-c2940963938="" class="ng-star-inserted">.</span>
          </ms-cmark-node>
        </p>
      </ms-cmark-node>
    </li>
  </ms-cmark-node>
</ol>

<ul _ngcontent-ng-c2940963938="" class="ng-star-inserted">
  <ms-cmark-node _ngcontent-ng-c2940963938="" _nghost-ng-c2940963938="">
    <li _ngcontent-ng-c2940963938="" class="ng-star-inserted">
      <ms-cmark-node _ngcontent-ng-c2940963938="" _nghost-ng-c2940963938="">
        <p _ngcontent-ng-c2940963938="" class="ng-star-inserted">
          <ms-cmark-node _ngcontent-ng-c2940963938="" _nghost-ng-c2940963938="">
            <strong _ngcontent-ng-c2940963938="" class="ng-star-inserted">
              <ms-cmark-node _ngcontent-ng-c2940963938="" _nghost-ng-c2940963938="">
                <span _ngcontent-ng-c2940963938="" class="ng-star-inserted">Famous Architecture:</span>
              </ms-cmark-node>
            </strong>

            <span _ngcontent-ng-c2940963938="" class="ng-star-inserted"></span>

            <strong _ngcontent-ng-c2940963938="" class="ng-star-inserted">
              <ms-cmark-node _ngcontent-ng-c2940963938="" _nghost-ng-c2940963938="">
                <span _ngcontent-ng-c2940963938="" class="ng-star-inserted">Mask R-CNN</span>
              </ms-cmark-node>
            </strong>

            <span _ngcontent-ng-c2940963938="" class="ng-star-inserted">is the undisputed king and poster child of this approach.</span>
          </ms-cmark-node>
        </p>
      </ms-cmark-node>
    </li>

    <li _ngcontent-ng-c2940963938="" class="ng-star-inserted">
      <ms-cmark-node _ngcontent-ng-c2940963938="" _nghost-ng-c2940963938="">
        <p _ngcontent-ng-c2940963938="" class="ng-star-inserted">
          <ms-cmark-node _ngcontent-ng-c2940963938="" _nghost-ng-c2940963938="">
            <strong _ngcontent-ng-c2940963938="" class="ng-star-inserted">
              <ms-cmark-node _ngcontent-ng-c2940963938="" _nghost-ng-c2940963938="">
                <span _ngcontent-ng-c2940963938="" class="ng-star-inserted">How it Works:</span>
              </ms-cmark-node>
            </strong>

            <span _ngcontent-ng-c2940963938="" class="ng-star-inserted">It's essentially a Faster R-CNN (for object detection) with an additional branch for predicting segmentation masks.</span>
          </ms-cmark-node>
        </p>
      </ms-cmark-node>
    </li>
  </ms-cmark-node>
</ul>
`;

html = `
<ol>
  <ms-cmark-node>
    <li>
      <ms-cmark-node>
        <p>
          <ms-cmark-node>
            <strong>
              <ms-cmark-node>
                <span>Detection Stage:</span>
              </ms-cmark-node>
            </strong>

            <span>
              First, find the bounding boxes of all objects in the image. A Region Proposal Network (RPN) or a similar detector does this. It also classifies each box (e.g., "this box is a car").
            </span>
          </ms-cmark-node>
        </p>
      </ms-cmark-node>
    </li>

    <li>
      <ms-cmark-node>
        <p>
          <ms-cmark-node>
            <strong>
              <ms-cmark-node>
                <span>Segmentation Stage:</span>
              </ms-cmark-node>
            </strong>

            <span>For each proposed bounding box, run a smaller segmentation model (a "mask head") to generate a pixel-perfect mask</span>

            <i>
              <ms-cmark-node>
                <span>only within that box</span>
              </ms-cmark-node>
            </i>

            <span>.</span>
          </ms-cmark-node>
        </p>
      </ms-cmark-node>
    </li>
  </ms-cmark-node>
</ol>

<ul>
  <ms-cmark-node>
    <li>
      <ms-cmark-node>
        <p>
          <ms-cmark-node>
            <strong>
              <ms-cmark-node>
                <span>Famous Architecture:</span>
              </ms-cmark-node>
            </strong>

            <span></span>

            <strong>
              <ms-cmark-node>
                <span>Mask R-CNN</span>
              </ms-cmark-node>
            </strong>

            <span>is the undisputed king and poster child of this approach.</span>
          </ms-cmark-node>
        </p>
      </ms-cmark-node>
    </li>

    <li>
      <ms-cmark-node>
        <p>
          <ms-cmark-node>
            <strong>
              <ms-cmark-node>
                <span>How it Works:</span>
              </ms-cmark-node>
            </strong>

            <span>It's essentially a Faster R-CNN (for object detection) with an additional branch for predicting segmentation masks.</span>
          </ms-cmark-node>
        </p>
      </ms-cmark-node>
    </li>
  </ms-cmark-node>
</ul>
`;

const document = new JSDOM('', { contentType: 'text/html' }).window.document;
const docfrag = JSDOM.fragment(html);
html = convert_documentFragment_to_htmlStr(document, docfrag);
console.log(html);
console.log('---')
let markdown = turndownServiceMain.turndown(html);
// console.log(markdown);
markdown = markdown.replace(regex_indicator.code_block_beginning, '');
markdown = await prettier.format(markdown, { parser: 'markdown', plugins: [parserMarkdown] });
console.log(markdown);
