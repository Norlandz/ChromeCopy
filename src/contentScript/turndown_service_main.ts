import TurndownService from 'turndown';
import type { Plugin } from 'turndown';

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
    return 'NN\n\n' + fence + language + '\n' + code.replace(/\n$/, '') + '\n' + fence + '\n\n';
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
    const texSource = node.querySelector('annotation[encoding="application/x-tex"]');
    // console.log('texSource:', texSource?.textContent);
    if (texSource) {
      // Wrap the raw TeX in single dollar signs for inline math
      // add extra space
      return ` $${texSource.textContent?.trim()}$ `;
      // @bug: this lib sucks
      // pre inside ms-katex is forcing linebreaks? // unless I force add \n here?
      // return '\nNO_LINE_BREAKS';
    }
    // Fallback if the annotation isn't found
    return '';
  },
});

// 3. Rule for display LaTeX (<ms-katex class="display">)
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
