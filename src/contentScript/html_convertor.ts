import { HtmlUtil } from './HtmlUtil';

export function convert_selection_to_documentFragment(selectionText: Selection): DocumentFragment {
  const range = selectionText.getRangeAt(0);
  const clonedSelection = range.cloneContents();
  return clonedSelection;
}

export function convert_documentFragment_to_htmlStr(document: Document, documentFragment: DocumentFragment): string {
  const div = document.createElement('div');
  div.appendChild(documentFragment);
  console.log('convert_documentFragment_to_htmlStr', documentFragment, div.innerHTML);

  // prevent parsing pre for inline latex
  for (const elt_KatexPre of div.querySelectorAll('ms-katex.inline pre')) {
    // ;main-test; // Parsing of nested Block-level element leads to skipping of some elements in filter. · Issue #497 · mixmark-io/turndown
    // ;main-test; // https://github.com/mixmark-io/turndown/issues/497
    const elt = HtmlUtil.changeTagName(document, elt_KatexPre, 'div');
    // @messy
    elt.setAttribute('data-was-pre', 'true');
  }

  // deal with pre inside custom tag problem
  // for (const elt_CodeBlock of div.querySelectorAll('ms-code-block pre>code')) {
  // }

  return div.innerHTML;
}
