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
      if (holder.querySelector('annotation, .katex-mathml')) {
        const blocksInside = Array.from(holder.querySelectorAll('div, pre, p'));
        blocksInside.forEach(b => {
          const s = fragment.ownerDocument.createElement('span');
          Array.from(b.attributes).forEach(attr => s.setAttribute(attr.name, attr.value));
          s.append(...Array.from(b.childNodes));
          b.replaceWith(s);
        });

        const span = fragment.ownerDocument.createElement('span');
        Array.from(holder.attributes).forEach(attr => span.setAttribute(attr.name, attr.value));
        span.classList.add('chrome-copy-math-holder');
        const items = Array.from(holder.childNodes);
        items.forEach(child => {
          if (child.nodeType === 3 && child.textContent?.trim() === '') return;
          span.appendChild(child);
        });
        holder.replaceWith(span);
      }
    });

    // 2. Fragment-Wide Formatting Purge
    const purgeNodes = (root: ParentNode) => {
      Array.from(root.childNodes).forEach(node => {
        if (node.nodeType === 3 && node.textContent?.trim() === '' && node.textContent?.includes('\n')) {
          node.remove();
        } else if (node.nodeType === 1 && ['P', 'DIV', 'LI', 'SPAN'].includes((node as Element).tagName)) {
          purgeNodes(node as ParentNode);
        }
      });
    };
    purgeNodes(fragment);

    // 3. Structural Stability (P to DIV)
    // Promote paragraphs that will hold or precede math to DIV so they can legally hold block children
    const paragraphs = Array.from(fragment.querySelectorAll('p'));
    paragraphs.forEach(p => {
      if (p.querySelector('.chrome-copy-math-holder, ms-katex, pre, div')) {
        GoogleAIStudioAdapter.promotePToDiv(p as HTMLParagraphElement);
      }
    });

    // 4. Zero-Width Space (ZWS) Glue
    const holders = Array.from(fragment.querySelectorAll('.chrome-copy-math-holder'));
    holders.forEach(holder => {
      const zws1 = holder.ownerDocument.createTextNode('\u200B');
      const zws2 = holder.ownerDocument.createTextNode('\u200B');
      holder.parentNode?.insertBefore(zws1, holder);
      holder.parentNode?.insertBefore(zws2, holder.nextSibling);
    });

    // 5. Parent-Locked Structural Restitching
    // Fusion of "ejected" siblings to ensure sentence integrity, even within LI
    const containers = Array.from(fragment.querySelectorAll('div, p'));
    containers.forEach(container => {
      let next = container.nextElementSibling;
      while (next) {
        const isMath = next.tagName === 'MS-KATEX' || next.classList.contains('chrome-copy-math-holder');
        const isInline = next.tagName === 'SPAN';
        const isFragmentP = next.tagName === 'P' || (next.tagName === 'DIV' && !next.querySelector('ul, li, blockquote'));
        
        if (isMath || isInline || isFragmentP) {
          container.appendChild(next);
          next = container.nextElementSibling;
        } else {
          break;
        }
      }
    });
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
                            
          return isDisplay ? `\n\n$$\n${latex}\n$$\n\n` : `$${latex}$`;
        }
      },
      {
        filter: (node: Node) => {
          return node.nodeName.toLowerCase() === 'span' && (node as Element).classList.contains('inline-code');
        },
        replacement: (content: string) => {
          return `\`${content.trim()}\``;
        }
      }
    ];
  }
}
