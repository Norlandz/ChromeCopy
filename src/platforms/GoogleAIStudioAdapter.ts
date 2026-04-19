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

    // 1. Tag Normalization (Kill internal block breaks)
    const mathHolders = Array.from(fragment.querySelectorAll('ms-katex, pre, div[data-was-pre="true"]'));
    mathHolders.forEach(holder => {
      const hasMath = !!holder.querySelector('annotation, .katex-mathml');
      if (hasMath) {
        const span = fragment.ownerDocument.createElement('span');
        Array.from(holder.attributes).forEach(attr => span.setAttribute(attr.name, attr.value));
        span.classList.add('chrome-copy-math-holder');
        const children = Array.from(holder.childNodes);
        children.forEach(child => {
          if (child.nodeType === 3 && child.textContent?.trim() === '') return;
          span.appendChild(child);
        });
        holder.replaceWith(span);
      }
    });

    // 2. Structural Stability (P to DIV)
    // Promote paragraphs that contain math to DIV so they can legally hold pre/div children
    const paragraphs = Array.from(fragment.querySelectorAll('p'));
    paragraphs.forEach(p => {
      if (p.querySelector('.chrome-copy-math-holder')) {
        GoogleAIStudioAdapter.promotePToDiv(p as HTMLParagraphElement);
      }
    });

    // 3. Surgical Re-fusion (Fix Shadow DOM ejection)
    const blocks = Array.from(fragment.querySelectorAll('div, p'));
    blocks.forEach(block => {
      let next = block.nextElementSibling;
      while (next && (next.tagName === 'SPAN' || next.tagName === 'MS-KATEX' || next.classList.contains('chrome-copy-math-holder'))) {
        block.appendChild(next);
        next = block.nextElementSibling;
      }
    });

    // 4. Text Stabilization
    const walker = fragment.ownerDocument.createTreeWalker(fragment, 4 /* SHOW_TEXT */);
    let node;
    while (node = walker.nextNode()) {
      node.textContent = node.textContent?.replace(/\n\s*/g, ' ') || '';
    }
  }

  public getRules(): TurndownService.Rule[] {
    return [
      {
        filter: (node: Node) => {
          const el = node as HTMLElement;
          const tag = el.tagName.toLowerCase();
          return tag === 'ms-katex' || el.classList.contains('chrome-copy-math-holder');
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
