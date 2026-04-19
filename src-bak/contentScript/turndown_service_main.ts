import type { Plugin } from 'turndown';
import TurndownService from 'turndown';
import { regex_indicator } from './regex_indicator';

// import turndownPluginGfm from 'turndown-plugin-gfm';
// @Xts-expect-error
// @ts-ignore
import * as turndownPluginGfm from '@guyplusplus/turndown-plugin-gfm';
// const turndownPluginGfm = require('@guyplusplus/turndown-plugin-gfm');
const gfm = turndownPluginGfm.gfm as Plugin;

// GFM (GitHub Flavored Markdown) feature
const turndownService = new TurndownService({
  headingStyle: 'atx', // Use # for headings
  hr: '---',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  fence: '```',
  emDelimiter: '_',
  strongDelimiter: '**',
  linkStyle: 'inlined',
  linkReferenceStyle: 'full', // no_need
  // br: ' \\',
  // blankReplacement: function (content, node, options) {
  //   // console.log('blankReplacement:', content, node, options);
  //   return 'replace_to_blank';
  // },
});

// turndownService.addRule('msKatex', {
//   filter: function (node, options) {
//     console.log('node:', node.nodeName);
//     return node.nodeName === 'MS-KATEX';
//   },
//   replacement: function (content, node) {
//     return '`' + content + '`';
//   },
// });

turndownService.use(gfm);

// @: order matters?..

// Fail to detect coding block when there is a space gap between `<pre> <code>`. · Issue #498 · mixmark-io/turndown
// https://github.com/mixmark-io/turndown/issues/498
// ;nah; deal with pre inside custom tag problem
// turndown/src/commonmark-rules.js at master · mixmark-io/turndown
// https://github.com/mixmark-io/turndown/blob/master/src/commonmark-rules.js
// rules.fencedCodeBlock = {
//   filter: function (node, options) {
//     return (
//       options.codeBlockStyle === 'fenced' &&
//       node.nodeName === 'PRE' &&
//       node.firstChild &&
//       node.firstChild.nodeName === 'CODE'
//     )
//   },
//
//   replacement: function (content, node, options) {
//     var className = node.firstChild.getAttribute('class') || ''
//     var language = (className.match(/language-(\S+)/) || [null, ''])[1]
//     var code = node.firstChild.textContent
//
//     var fenceChar = options.fence.charAt(0)
//     var fenceSize = 3
//     var fenceInCodeRegex = new RegExp('^' + fenceChar + '{3,}', 'gm')
//
//     var match
//     while ((match = fenceInCodeRegex.exec(code))) {
//       if (match[0].length >= fenceSize) {
//         fenceSize = match[0].length + 1
//       }
//     }
//
//     var fence = repeat(fenceChar, fenceSize)
//
//     return (
//       '\n\n' + fence + language + '\n' +
//       code.replace(/\n$/, '') +
//       '\n' + fence + '\n\n'
//     )
//   }
// }
function repeat(character: string, count: number) {
  return Array(count + 1).join(character);
}

/**
 * Traverses a node's children to extract text content while
 * converting <br> elements into newline characters.
 * @param {Node} parentNode The parent node to extract text from.
 * @returns {string} The formatted text content.
 */
function getTextWithLineBreaks(parentNode: Node): string {
  let text = '';
  // Loop through all direct child nodes of the parent
  parentNode.childNodes.forEach((child: Node) => {
    if (child.nodeType === Node.TEXT_NODE) {
      // If it's a text node, append its content
      text += child.textContent;
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      // If it's an element node...
      const element = child as HTMLElement;
      if (element.nodeName === 'BR') {
        // ...and it's a <br>, append a newline
        text += '\n';
      } else {
        // For any other element (e.g., a <span> inside the <pre>),
        // recursively call this function to process its children.
        text += getTextWithLineBreaks(element);
      }
    }
    // We can ignore other node types like comments, etc.
  });
  return text;
}

// dk the order of adding of the rule matters
turndownService.addRule('pre_block', {
  // nvm manually added in modification of the html... maybe dont do that ...
  filter: function (node, options) {
    // notice the !== code here ...
    // console.log(node.nodeName, node.firstElementChild?.nodeName);
    return !!(options.codeBlockStyle === 'fenced' && node.nodeName === 'PRE' && node.firstElementChild && node.firstElementChild.nodeName !== 'CODE');
  },
  replacement: function (content, node, options) {
    // return '\n\n```\n' + node.textContent + '\n```\n\n';
    return '\n\n```\n' + getTextWithLineBreaks(node) + '\n```\n\n';
  },
});

// select 'ms-code-block pre:has(>code)'
turndownService.addRule('preCodeBlock', {
  filter: function (node, options) {
    // return node.matches('ms-code-block pre');
    // return !!(node.matches('ms-code-block pre') && node.firstChild && node.firstChild.nodeName === 'CODE');
    // dont use node, cuz it can be white space
    return !!(options.codeBlockStyle === 'fenced' && node.nodeName === 'PRE' && node.firstElementChild && node.firstElementChild.nodeName === 'CODE');
  },
  replacement: function (content, node, options) {
    // return '\n```\n' + node.textContent + '\n```\n';

    // const firstChild = node.firstChild;
    // // Node.TEXT_NODE
    // if (firstChild && firstChild.nodeType === 3) {
    //   const textContent = firstChild.textContent;
    //   if (textContent && textContent.trim() === '') {
    //     const elt_Code = node.firstElementChild;
    //     // elt_Code?.insertAdjacentText('afterbegin', textContent);
    //     if (elt_Code == null) {
    //       throw new Error('elt_Code is null');
    //     }
    //     // elt_Code.prepend(firstChild);
    //     elt_Code.insertBefore(firstChild, elt_Code.firstChild);
    //   }
    // }
    // console.log('node:', node.outerHTML);

    const elt_Code = node.firstElementChild as HTMLElement;
    const className = elt_Code.getAttribute('class') || '';
    const language = (className.match(/language-(\S+)/) || [null, ''])[1];
    const code = elt_Code.textContent ?? '';
    // const code = node.textContent ?? '';

    const fenceChar = options.fence?.charAt(0) || '`';
    let fenceSize = 3;
    const fenceInCodeRegex = new RegExp('^' + fenceChar + '{3,}', 'gm');

    let match;
    while ((match = fenceInCodeRegex.exec(code))) {
      if (match[0].length >= fenceSize) {
        fenceSize = match[0].length + 1;
      }
    }

    const fence = repeat(fenceChar, fenceSize);

    // @bug: force to add a char to remove the extra code space gap
    // For code blocks, an extra indent is added to the final output. · Issue #499 · mixmark-io/turndown
    // https://github.com/mixmark-io/turndown/issues/499
    // return 'NN\n\n' + fence + language + '\n' + code.replace(/\n$/, '') + '\n' + fence + '\n\n';
    // @timing_wrong
    return regex_indicator.code_block_beginning + '\n\n' + fence + language + '\n' + code.replace(/\n$/, '') + '\n' + fence + '\n\n';

    // const result = 'NN\n' + fence + language + '\n' + code.replace(/\n$/, '') + '\n' + fence + '\n\n'
    // // const result = '\n\n' + fence + language + '\n' + code.replace(/\n$/, '') + '\n' + fence + '\n\n'
    // // console.log('result:', result);
    // return result;
  },
});

// 1. Rule for inline code with the class "inline-code"
turndownService.addRule('inlineCode', {
  filter: function (node, options) {
    return node.nodeName === 'SPAN' && node.classList.contains('inline-code');
  },
  replacement: function (content) {
    return '`' + content + '`';
  },
});

// 2. Rule for inline LaTeX (<ms-katex class="inline">)
turndownService.addRule('inlineKatex', {
  filter: function (node, options) {
    // console.log('node:', node.nodeName);
    // console.log('node:', node.nodeName, node.tagName, node.localName, node);
    if (node.nodeName.toLowerCase() === 'ms-katex' && node.classList.contains('inline')) {
      return true;
    }
    function _selector(preNode: HTMLElement) {
      // @messy
      // if (!preNode || (preNode.tagName.toLowerCase() !== 'pre' && !preNode.hasAttribute('data-was-pre'))) {
      // @bug must use div not attr, else has newline????
      if (!preNode || (preNode.tagName.toLowerCase() !== 'pre' && preNode.tagName.toLowerCase() !== 'div')) {
        return false;
      }

      // 1. Check the preceding sibling: must be a <p> with <ms-katex.inline>
      const prevSibling = preNode.previousElementSibling;
      if (!prevSibling || prevSibling.tagName.toLowerCase() !== 'p') {
        return false;
      }
      const hasKatex = prevSibling.querySelector('ms-katex.inline');
      if (!hasKatex) {
        return false;
      }

      //       // 2. Check the following sibling: must be an empty <p>
      //       const nextSibling = preNode.nextElementSibling;
      //       if (!nextSibling || nextSibling.tagName.toLowerCase() !== 'p') {
      //         return false;
      //       }
      //
      //       // Check if the next <p> is truly empty (no text content and no children)
      //       // Trim to account for whitespace characters like newlines or spaces
      //       const isNextPEmpty = nextSibling.textContent?.trim() === '' && nextSibling.children.length === 0;
      //       if (!isNextPEmpty) {
      //         return false;
      //       }

      // If all checks pass
      return true;
    }
    // @pb[<pre> inside <p> shadow dom parsing problem]
    if (_selector(node)) {
      // if (node.matches('p:has( ms-katex.inline) + pre:has(+ p:empty)')) {
      // if (node.matches('p:has( ms-katex.inline)')) {
      return true;
    }
    return false;
  },
  replacement: function (content, node) {
    // console.log('inlineKatex:', content);
    // console.log('inlineKatex:', node.outerHTML);
    // Find the annotation tag which holds the raw TeX source
    const el_latex_anno = node.querySelector('annotation[encoding="application/x-tex"]');
    // console.log('texSource:', texSource?.textContent);
    if (el_latex_anno == null) {
      // Fallback if the annotation isn't found
      console.error('el_latex_anno is not found', node);
      return '';
    }
    // Wrap the raw TeX in single dollar signs for inline math
    // add extra space
    return ` $${el_latex_anno.textContent?.trim()}$ `;
    // @bug: this lib sucks
    // pre inside ms-katex is forcing linebreaks? // unless I force add \n here?
    // return '\nNO_LINE_BREAKS';
  },
});

turndownService.addRule('inline_latex_zhihu', {
  filter: function (node, options) {
    //     ztext-math
    // tex2jax_ignore math-holder
    if (node.classList.contains('ztext-math')) {
      return true;
    }
    return false;
  },
  replacement: function (content, node) {
    // jsdom & nodejs env thing.... @no_time @8*
    // if (!(node instanceof Element)) {
    //   console.error('node is not an Element', typeof node, node.constructor.name);
    //   return '';
    // }
    const latex_str = (node as Element).getAttribute('data-tex');
    if (latex_str == null) {
      console.error('latex_str is not found', typeof node, node.constructor.name);
      return '';
    }
    // console.log('latex_str:', latex_str);
    return ` $${latex_str.trim()}$ `;
  },
});

turndownService.addRule('inline_latex_wiki', {
  filter: function (node, options) {
    if (node.classList.contains('mwe-math-element')) {
      return true;
    }
    return false;
  },
  replacement: function (content, node) {
    const el_latex_anno = node.querySelector('annotation[encoding="application/x-tex"]');
    if (el_latex_anno == null) {
      console.error('el_latex_anno is not found', node);
      return '';
    }
    // console.log('latex_str:', el_latex_anno.textContent.trim());
    return ` $${el_latex_anno.textContent?.trim()}$ `;
  },
});

// turndownService.addRule('inline_latex_stackexchange', {
//   filter: function (node, options) {
//     if (node.classList.contains('math-container')) {
//       return true;
//     }
//     return false;
//   },
//   replacement: function (content, node) {
//     const el_latex_anno = node.querySelector('script[type="math/tex"]');
//     if (el_latex_anno == null) {
//       console.error('el_latex_anno is not found', node);
//       return '';
//     }
//     // console.log('latex_str:', el_latex_anno.textContent.trim());
//     return ` $${el_latex_anno.textContent?.trim()}$ `;
//   },
// });

function det_is_el_latex_annot_stackexchange(node: Element | null): node is HTMLScriptElement {
  const el_latex_anno = node;
  if (el_latex_anno == null) {
    return false;
  }
  if (el_latex_anno.tagName.toLowerCase() !== 'script') {
    return false;
  }
  if (el_latex_anno.getAttribute('type') !== 'math/tex') {
    return false;
  }
  return true;
}

turndownService.addRule('inline_latex_stackexchange', {
  filter: function (node, options) {
    if (node.classList.contains('MathJax')) {
      return true;
    }
    if (det_is_el_latex_annot_stackexchange(node)) {
      return true;
    }
    return false;
  },
  replacement: function (content, node) {
    // @path[20%]
    if (det_is_el_latex_annot_stackexchange(node as Element)) {
      // remove the duplicate of the script tag
      return '';
    }

    // @path[normal]
    const el_latex_anno = (node as HTMLElement).nextElementSibling;
    if (!det_is_el_latex_annot_stackexchange(el_latex_anno)) {
      console.error('el_latex_anno is not a math/tex script', el_latex_anno);
      return '';
    }
    // console.log('latex_str:', el_latex_anno.textContent.trim());
    return ` $${el_latex_anno.textContent?.trim()}$ `;
  },
});

// 3. Rule for block LaTeX (<ms-katex class="display">)
turndownService.addRule('displayKatex', {
  filter: function (node, options) {
    if (node.nodeName.toLowerCase() === 'ms-katex' && node.classList.contains('display')) {
      return true;
    }
    function _selector(preNode: HTMLElement) {
      if (!preNode || preNode.tagName.toLowerCase() !== 'pre') {
        return false;
      }
      const prevSibling = preNode.previousElementSibling;
      if (!prevSibling || prevSibling.tagName.toLowerCase() !== 'p') {
        return false;
      }
      const hasKatex = prevSibling.querySelector('ms-katex.display');
      if (!hasKatex) {
        return false;
      }
      return true;
    }
    // @pb[<pre> inside <p> shadow dom parsing problem]
    if (_selector(node)) {
      // if (node.matches('p:has( ms-katex.display) + pre:has(+ p:empty)')) {
      // if (node.matches('p:has( ms-katex.display)')) {
      return true;
    }
    return false;
  },
  replacement: function (content, node) {
    const texSource = node.querySelector('annotation[encoding="application/x-tex"]');
    if (texSource) {
      return '\n\n$$\n' + texSource.textContent?.trim() + '\n$$\n\n';
    }
    return '';
  },
});

export { turndownService as turndownServiceMain };
