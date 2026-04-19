import { IPlatformAdapter } from '../core/MarkdownConverter';
import { DomProcessor } from '../core/DomProcessor';
import { LatexExtractor } from '../core/LatexExtractor';
import TurndownService from 'turndown';

export class GoogleAIStudioAdapter implements IPlatformAdapter {
  public name = 'google-ai-studio';

  public matches(url: string): boolean {
    return url.includes('aistudio.google.com');
  }


  public preprocess(fragment: DocumentFragment): void {
    // 1. Strip the custom wrapper tags
    DomProcessor.flattenCustomWrappers(fragment, ['ms-cmark-node']);

    // 2. Structural Re-stitching: Fix the "Shadow DOM Sibling" bug
    const paragraphs = fragment.querySelectorAll('p');
    paragraphs.forEach(p => {
      const next = p.nextElementSibling;
      if (next && (next.tagName === 'PRE' || next.tagName === 'DIV')) {
         const hasMath = next.querySelector('annotation[encoding="application/x-tex"], script[type^="math/tex"]');
         if (hasMath) {
            p.append(...Array.from(next.childNodes));
            next.remove();
         }
      }
    });

    // 3. Clean Marker Normalization
    const walker = document.createTreeWalker(fragment, NodeFilter.SHOW_ELEMENT);
    let node: Node | null = walker.nextNode();
    const replacements: { oldNode: Node, newNode: Node }[] = [];

    while (node) {
      const el = node as HTMLElement;
      if (el.nodeName.toLowerCase() === 'ms-katex') {
        const type = el.classList.contains('display') || el.closest('.display') ? 'display' : 'inline';
        const latex = LatexExtractor.extract(el);
        
        if (latex) {
          const span = document.createElement('span');
          span.setAttribute('data-chrome-copy-math', type);
          span.setAttribute('data-latex', latex);
          replacements.push({ oldNode: el, newNode: span });
        }
      }
      node = walker.nextNode();
    }

    replacements.forEach(({ oldNode, newNode }) => (oldNode as HTMLElement).replaceWith(newNode));
  }

  public getRules(): TurndownService.Rule[] {
    return [
      {
        filter: (node: Node) => {
          const el = node as Element;
          return el.getAttribute?.('data-chrome-copy-math') === 'inline';
        },
        replacement: (content: string, node: Node) => {
          const latex = (node as Element).getAttribute('data-latex');
          return latex ? ` $${latex}$ ` : content;
        }
      },
      {
        filter: (node: Node) => {
          const el = node as Element;
          return el.getAttribute?.('data-chrome-copy-math') === 'display';
        },
        replacement: (content: string, node: Node) => {
          const latex = (node as Element).getAttribute('data-latex');
          return latex ? `\n\n$$\n${latex}\n$$\n` : content;
        }
      },
      {
        filter: (node: Node) => {
          return node.nodeName.toLowerCase() === 'span' && (node as Element).classList.contains('inline-code');
        },
        replacement: (content: string) => {
          return ` \`${content.trim()}\` `;
        }
      }
    ];
  }
}
