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

    // 1. Structural Stability (P to DIV)
    // Avoid browsers mangling <p> tags by ejecting block-level math nodes.
    const paragraphs = Array.from(fragment.querySelectorAll('p'));
    paragraphs.forEach(p => {
      if (p.querySelector('ms-katex, .katex, pre, div[data-was-pre]')) {
        GoogleAIStudioAdapter.promotePToDiv(p as HTMLParagraphElement);
      }
    });

    // 2. Targeted Re-stitching
    // Pull orphaned math siblings back into their preceding container.
    const containers = Array.from(fragment.querySelectorAll('div, p'));
    containers.forEach(container => {
      let next = container.nextElementSibling;
      while (next && (next.tagName === 'MS-KATEX' || next.tagName === 'PRE' || (next.tagName === 'DIV' && next.getAttribute('data-was-pre') === 'true'))) {
         container.appendChild(next);
         next = container.nextElementSibling;
      }
    });

    // 3. Inline Normalization (The Line-Break Fix)
    // Convert all math-holding block elements to SPANs to force Turndown into inline mode.
    const mathBlocks = Array.from(fragment.querySelectorAll('pre, div[data-was-pre="true"], ms-katex'));
    mathBlocks.forEach(block => {
      if (block.querySelector('annotation, .katex-mathml')) {
        const span = fragment.ownerDocument.createElement('span');
        Array.from(block.attributes).forEach(attr => span.setAttribute(attr.name, attr.value));
        span.append(...Array.from(block.childNodes));
        block.replaceWith(span);
      }
    });
  }

  public getRules(): TurndownService.Rule[] {
    return [
      {
        // High-fidelity Math Rule
        filter: (node: Node) => {
          const el = node as Element;
          const tag = el.tagName.toLowerCase();
          
          // Match our normalized spans or the original tags if they escaped normalization
          return tag === 'ms-katex' || 
                 tag === 'pre' || 
                 (tag === 'div' && el.getAttribute('data-was-pre') === 'true') ||
                 (tag === 'span' && el.querySelector('annotation, .katex-mathml') !== null);
        },
        replacement: (content: string, node: Node) => {
          const el = node as Element;
          const latex = LatexExtractor.extract(el);
          if (!latex) return content;
          
          const isDisplay = el.classList.contains('display') || 
                            el.closest('.display') !== null || 
                            el.querySelector('.katex-display') !== null;
                            
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
