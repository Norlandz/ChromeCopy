import { HtmlUtil } from './HtmlUtil';

export function convert_selection_to_documentFragment(selectionText: Selection): DocumentFragment {
  const range = selectionText.getRangeAt(0);
  const clonedSelection = range.cloneContents();
  return clonedSelection;
}

export function convert_documentFragment_to_htmlStr(document: Document, documentFragment: DocumentFragment): string {
  const div = document.createElement('div');
  div.appendChild(documentFragment);
  // console.info('convert_documentFragment_to_htmlStr', documentFragment, div.innerHTML);

  // // add wrap the inside of pre block with an extra code block, if pre didnt have one
  // for (const pre of div.querySelectorAll('pre')) {
  //   if (!pre.firstElementChild || pre.firstElementChild.tagName !== 'CODE') {
  //     const code = document.createElement('code');
  //     code.append(...pre.childNodes);
  //     pre.append(code);
  //   }
  // }

  // prevent parsing pre for inline latex
  for (const elt_KatexPre of div.querySelectorAll('ms-katex.inline pre')) {
    // ;main-test; // Parsing of nested Block-level element leads to skipping of some elements in filter. · Issue #497 · mixmark-io/turndown
    // ;main-test; // https://github.com/mixmark-io/turndown/issues/497
    const elt = HtmlUtil.changeTagName(document, elt_KatexPre, 'div');
    // @messy
    elt.setAttribute('data-was-pre', 'true');
  }

  // deal with li inside custom tag problem
  for (const elt_ms_cmark_node of div.querySelectorAll('ol > ms-cmark-node, ul > ms-cmark-node')) {
    elt_ms_cmark_node.replaceWith(...elt_ms_cmark_node.childNodes);
  }

  // deal with pre inside custom tag problem
  // for (const elt_CodeBlock of div.querySelectorAll('ms-code-block pre>code')) {
  // }

  // if
  // the pre is inside a custom tag
  // && there is no non-space text before the pre
  // && there is a any leading space like: `<pre><code>      ` & `<pre>      <code>`
  // for (const node of div.querySelectorAll('pre')) {
  //   if (!(node.firstElementChild && node.firstElementChild.nodeName === 'CODE')) {
  //     continue;
  //   }
  //   const firstChild = node.firstChild;
  //   // Node.TEXT_NODE
  //   if (firstChild && firstChild.nodeType === 3) {
  //     const textContent = firstChild.textContent;
  //     if (textContent && textContent.trim() === '') {
  //       const elt_Code = node.firstElementChild;
  //       // elt_Code?.insertAdjacentText('afterbegin', textContent);
  //       if (elt_Code == null) {
  //         throw new Error('elt_Code is null');
  //       }
  //       // elt_Code.prepend(firstChild);
  //       elt_Code.insertBefore(firstChild, elt_Code.firstChild);
  //     }
  //   }
  //   console.log(node.outerHTML);
  // }

  return div.innerHTML;
}
