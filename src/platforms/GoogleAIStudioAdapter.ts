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
    // 1. Initial cleanup of custom wrapper nodes
    DomProcessor.flattenCustomWrappers(fragment, ['ms-cmark-node']);

    // 2. Structural Re-stitching (Fix Shadow DOM ejection)
    const blockStoppers = ['UL', 'OL', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'HR', 'BLOCKQUOTE', 'TABLE', 'LI'];
    const topLevelPs = Array.from(fragment.childNodes).filter(n => n.nodeName === 'P');
    topLevelPs.forEach(pNode => {
      const p = pNode as Element;
      let next = p.nextSibling;
      while (next) {
        if (next.nodeType === 3) {
          p.appendChild(next);
        } else if (next.nodeType === 1) {
          const el = next as Element;
          if (blockStoppers.includes(el.tagName)) break;
          
          if (el.tagName === 'P') {
            while (el.firstChild) p.appendChild(el.firstChild);
            el.remove();
          } else {
            p.appendChild(el);
          }
        } else {
          p.appendChild(next);
        }
        next = p.nextSibling;
      }
    });

    // 3. High-Fidelity Normalization (Surgical Source preservation)
    // We target math nodes and replace them with clean spans.
    const mathHolders = Array.from(fragment.querySelectorAll('ms-katex, div[data-was-pre="true"], pre.display'));
    mathHolders.forEach(node => {
      // If this node is already inside a holder we just created, skip it
      if (node.closest('.chrome-copy-math-holder')) return;

      const source = node.querySelector('annotation[encoding="application/x-tex"], script[type^="math/tex"]');
      if (!source) return;

      const isDisplay = node.classList.contains('display') || 
                        node.tagName === 'PRE' ||
                        node.querySelector('.katex-display') !== null;

      const holder = fragment.ownerDocument.createElement('span');
      holder.className = 'chrome-copy-math-holder';
      if (isDisplay) holder.classList.add('display');
      
      holder.appendChild(source);
      node.replaceWith(holder);
    });

    // 4. Cleanup Artifacts
    const artifacts = Array.from(fragment.querySelectorAll('ms-katex, [data-was-pre="true"], .katex-html, .katex-mathml'));
    artifacts.forEach(a => a.remove());

    // 5. Final Paragraph Normalization (Whitespace & Sentence Integrity)
    const allPs = Array.from(fragment.querySelectorAll('p'));
    allPs.forEach(p => {
      // 5a. Collapse all whitespace inside text nodes
      const walker = fragment.ownerDocument.createTreeWalker(p, NodeFilter.SHOW_TEXT);
      let tNode: Node | null;
      while (tNode = walker.nextNode()) {
        tNode.textContent = tNode.textContent?.replace(/\s+/g, ' ') || '';
      }
      
      // 5b. Remove leading/trailing space in the paragraph's inner text flow
      if (p.firstChild && p.firstChild.nodeType === 3) {
        p.firstChild.textContent = p.firstChild.textContent?.trimStart() || '';
      }
      if (p.lastChild && p.lastChild.nodeType === 3) {
        p.lastChild.textContent = p.lastChild.textContent?.trimEnd() || '';
      }

      // 5c. Cleanup empty paragraphs
      if (!p.textContent?.trim() && !p.querySelector('.chrome-copy-math-holder')) {
        p.remove();
      }
    });
  }

  public getRules(): TurndownService.Rule[] {
    return [
      {
        filter: (node: Node) => {
          return (node as Element).classList?.contains('chrome-copy-math-holder');
        },
        replacement: (content: string, node: Node) => {
          const el = node as Element;
          const latex = LatexExtractor.extract(el);
          if (!latex) return content;
          
          const isDisplay = el.classList.contains('display');
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
