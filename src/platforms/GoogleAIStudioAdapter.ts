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

    // 2. Structural Re-stitching: Fix the "Shadow DOM Sibling" bug
    // We greedily move all following siblings that are not "real" blocks back into the container.
    // This handles cases where the browser pops math and punctuation out of a paragraph.
    const containers = Array.from(fragment.querySelectorAll('p, div'));
    containers.forEach(container => {
      let next = container.nextElementSibling;
      
      while (next) {
        const tag = next.tagName.toLowerCase();
        const hasMath = next.querySelector('ms-katex, .katex, annotation[encoding="application/x-tex"]') !== null;
        
        // We stitch if it's a math holder, a fragmented tag (ng-star), OR just plain inline content (span/text)
        // that belongs to this sentence. We stop at "hard" blocks like P, UL, LI, or another DIV.
        const isInlineOrMangled = tag === 'ms-katex' || tag === 'pre' || tag === 'span' || tag === 'strong' || tag === 'em' || tag === 'code';
        const isTextOnlyDiv = tag === 'div' && next.querySelectorAll('p, ul, li, div').length === 0;

        if (hasMath || isInlineOrMangled || isTextOnlyDiv) {
          const toMove = next;
          next = next.nextElementSibling;
          container.appendChild(toMove);
        } else {
          break;
        }
      }

      // Promote P to DIV if it contains math or fragmented blocks to avoid further mangling
      if (container.tagName === 'P' && (container.querySelector('ms-katex, .katex, pre') || container.childNodes.length > 5)) {
        GoogleAIStudioAdapter.promotePToDiv(container as HTMLParagraphElement);
      }
    });

    // 3. Inline Normalization
    // If we moved a PRE block into a container, normalize it to SPAN to treat it as inline.
    const nestedPres = Array.from(fragment.querySelectorAll('div pre, p pre'));
    nestedPres.forEach(pre => {
      if (pre.querySelector('annotation, .katex-mathml')) {
        const span = fragment.ownerDocument.createElement('span');
        Array.from(pre.attributes).forEach(attr => span.setAttribute(attr.name, attr.value));
        span.append(...Array.from(pre.childNodes));
        pre.replaceWith(span);
      }
    });
  }

  public getRules(): TurndownService.Rule[] {
    return [
      {
        // Robust Math Rule: Matches ms-katex AND its mangled/normalized siblings (PRE or SPAN)
        filter: (node: Node) => {
          const el = node as Element;
          const tag = el.tagName.toLowerCase();
          
          if (tag === 'ms-katex') return true;
          
          // Match mangled holders (PRE) or normalized holders (SPAN) that contain math metadata
          if (tag === 'pre' || tag === 'span') {
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
