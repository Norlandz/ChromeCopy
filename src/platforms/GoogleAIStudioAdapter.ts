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

    // 2. Targeted Visual Purge
    const junkSelectors = [
      '.katex-html', 
      '.katex-mathml', 
      'span[class*="rf-rgi-cb"]', 
      'span[id*="zva"]',
      'button',
      'ms-tooltip'
    ];
    junkSelectors.forEach(sel => {
      const junk = Array.from(fragment.querySelectorAll(sel));
      junk.forEach(j => j.remove());
    });

    // 3. Surgical Re-stitching (Shadow DOM ejection fix)
    const blockStoppers = ['UL', 'OL', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'HR', 'BLOCKQUOTE', 'TABLE', 'LI', 'PRE'];
    const nodes = Array.from(fragment.childNodes);
    nodes.forEach(node => {
      if (node.nodeType === 1 && node.nodeName === 'P') {
        const p = node as Element;
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
      }
    });

    // 3. Precision Math Normalization (Protected Token Strategy)
    const mathNodes = Array.from(fragment.querySelectorAll('ms-katex, div[data-was-pre="true"], pre.display'));
    mathNodes.forEach(node => {
      const source = node.querySelector('annotation[encoding="application/x-tex"], script[type^="math/tex"]');
      const latex = source?.textContent?.trim() || '';
      if (!latex) return;

      const isDisplay = node.classList.contains('display') || 
                        node.getAttribute('class')?.includes('display') ||
                        node.querySelector('.katex-display') !== null ||
                        node.tagName === 'PRE';

      // Use CODE tag to protect content from Turndown escaping
      const holder = fragment.ownerDocument.createElement('code');
      holder.className = 'chrome-copy-math-holder';
      if (isDisplay) holder.classList.add('display');
      holder.textContent = `@@CHROME_MATH@@${latex}@@`;
      
      if (node.parentNode) {
        node.parentNode.replaceChild(holder, node);
      }
    });

    // 4. Total Structural Flattening (Kill all intermediate spans)
    DomProcessor.flattenCustomWrappers(fragment, ['ms-katex', 'ms-cmark-node', 'span']);

    // 5. Final Sentence Normalization
    const allPs = Array.from(fragment.querySelectorAll('p'));
    allPs.forEach(p => {
      // 5a. Mask Bullet Markers to stop Turndown list-item logic
      if (p.firstChild?.nodeType === 3) {
        const text = p.firstChild.textContent || '';
        if (text.startsWith('- ')) {
          p.firstChild.textContent = text.replace(/^- /, '【CC_BULLET】 ');
        }
      }

      // 5b. Whitespace Normalization (inside P only)
      const walker = fragment.ownerDocument.createTreeWalker(p, 4); // SHOW_TEXT
      let tNode: Node | null;
      while (tNode = walker.nextNode()) {
        const text = tNode.textContent || '';
        // Skip math placeholders
        if (text.includes('@@CHROME_MATH@@')) continue;
        tNode.textContent = text.replace(/[\n\r\t]+/g, ' ');
      }
      p.normalize();

      // 5c. Trim boundaries
      if (p.lastChild?.nodeType === 3) p.lastChild.textContent = p.lastChild.textContent?.trimEnd() || '';
      if (p.firstChild?.nodeType === 3) p.firstChild.textContent = p.firstChild.textContent?.trimStart() || '';
      
      if (!p.textContent?.trim() && !p.querySelector('.chrome-copy-math-holder, img')) {
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
          // Extract latex from the protected token
          const match = content.match(/@@CHROME_MATH@@([\s\S]*?)@@/);
          const latex = match ? match[1] : content.trim();
          if (!latex) return '';
          
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
