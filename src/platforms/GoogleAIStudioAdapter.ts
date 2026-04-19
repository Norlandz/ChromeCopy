import { IPlatformAdapter } from '../core/MarkdownConverter';
import { DomProcessor } from '../core/DomProcessor';
import { LatexExtractor } from '../core/LatexExtractor';
import TurndownService from 'turndown';

export class GoogleAIStudioAdapter implements IPlatformAdapter {
  public name = 'google-ai-studio';

  public matches(url: string): boolean {
    return url.includes('aistudio.google.com');
  }

  public getTagsToKeep(): string[] {
    return ['ms-katex'];
  }

  public preprocess(fragment: DocumentFragment): void {
    // 1. Strip the custom wrapper tags
    DomProcessor.flattenCustomWrappers(fragment, ['ms-cmark-node']);

    // 2. Multi-stage tag discovery (TreeWalker is more robust for custom elements)
    const walker = document.createTreeWalker(fragment, NodeFilter.SHOW_ELEMENT);
    let node: Node | null = walker.nextNode();
    while (node) {
      const el = node as Element;
      if (el.nodeName.toLowerCase() === 'ms-katex') {
        const type = el.classList.contains('display') ? 'display' : 'inline';
        el.setAttribute('data-chrome-copy-math', type);
        console.log(`[DEBUG] Tagged math node at path: ${el.parentElement?.nodeName} > ${el.nodeName}`);
      }
      node = walker.nextNode();
    }
  }

  public getRules(): TurndownService.Rule[] {
    const isMathSibling = (node: Node) => {
      const el = node as HTMLElement;
      if (!el || (el.tagName?.toLowerCase() !== 'pre' && el.tagName?.toLowerCase() !== 'div')) {
        return false;
      }
      const prev = el.previousElementSibling;
      if (!prev || prev.tagName.toLowerCase() !== 'p') return false;
      return !!prev.querySelector('ms-katex');
    };

    return [
      {
        filter: (node: Node) => {
          const el = node as Element;
          if (el.getAttribute?.('data-chrome-copy-math') === 'inline') return true;
          if (el.nodeName?.toLowerCase() === 'ms-katex' && el.classList?.contains('inline')) return true;
          return isMathSibling(node);
        },
        replacement: (content: string, node: Node) => {
          const latex = LatexExtractor.extract(node as Element);
          return latex ? ` $${latex}$ ` : content;
        }
      },
      {
        filter: (node: Node) => {
          const el = node as Element;
          return el.getAttribute?.('data-chrome-copy-math') === 'display' || 
                 (el.nodeName?.toLowerCase() === 'ms-katex' && el.classList?.contains('display'));
        },
        replacement: (content: string, node: Node) => {
          const latex = LatexExtractor.extract(node as Element);
          // Fix: Avoid double \n\n if possible to reduce "extra air"
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
