import { IPlatformAdapter } from '../core/MarkdownConverter';
import { DomProcessor } from '../core/DomProcessor';
import { LatexExtractor } from '../core/LatexExtractor';
import TurndownService from 'turndown';

export class GoogleAIStudioAdapter implements IPlatformAdapter {
  public name = 'google-ai-studio';

  public matches(url: string): boolean {
    return url.includes('aistudio.google.com');
  }


  public static promotePToDiv(p: HTMLParagraphElement): HTMLDivElement {
    const div = p.ownerDocument.createElement('div');
    Array.from(p.attributes).forEach(attr => div.setAttribute(attr.name, attr.value));
    div.append(...Array.from(p.childNodes));
    p.replaceWith(div);
    return div;
  }

  public preprocess(fragment: DocumentFragment): void {
    DomProcessor.flattenCustomWrappers(fragment, ['ms-cmark-node']);

    // Fix orphaned siblings: move them back into the preceding container
    // and ensure the container is a DIV.
    const containers = Array.from(fragment.querySelectorAll('p, div'));
    containers.forEach(container => {
      const next = container.nextElementSibling;
      if (next && (next.tagName === 'MS-KATEX' || next.tagName === 'PRE' || next.tagName === 'DIV')) {
        const hasMath = next.tagName === 'MS-KATEX' || next.querySelector('ms-katex, .katex, annotation[encoding="application/x-tex"]');
        if (hasMath) {
          container.appendChild(next);
        }
      }
      
      if (container.tagName === 'P' && container.querySelector('ms-katex, .katex, pre')) {
        GoogleAIStudioAdapter.promotePToDiv(container as HTMLParagraphElement);
      }
    });
  }

  public getRules(): TurndownService.Rule[] {
    return [
      {
        // Robust Math Rule: Matches ms-katex AND its mangled siblings (PRE)
        filter: (node: Node) => {
          const el = node as Element;
          const tag = el.tagName.toLowerCase();
          
          if (tag === 'ms-katex') return true;
          
          // Mangled sibling case: ONLY match PRE if it is a pure math holder.
          if (tag === 'pre') {
            return !!el.querySelector('annotation[encoding="application/x-tex"], .katex-mathml');
          }
          
          return false;
        },
        replacement: (content: string, node: Node) => {
          const el = node as Element;
          const latex = LatexExtractor.extract(el);
          if (!latex) return content;
          
          const isDisplay = el.classList.contains('display') || 
                            el.closest('.display') !== null || 
                            el.querySelector('.display') !== null;
                            
          return isDisplay ? `\n\n$$\n${latex}\n$$\n\n` : ` $${latex}$ `;
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
