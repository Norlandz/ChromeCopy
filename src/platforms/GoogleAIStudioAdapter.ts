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
    const doc = fragment.ownerDocument;

    // 1. [SURGICAL SHIELDING] Find and replace the HIGHEST math container
    // This targets the container (ms-katex) or the wrapper (pre/code) if it contains math.
    const mathSources = Array.from(fragment.querySelectorAll('ms-katex, math, .katex'));
    
    mathSources.forEach(source => {
      if (!source.parentNode || !fragment.contains(source)) return;

      const latex = LatexExtractor.extract(source as Element);
      if (latex) {
        // Find the absolute highest math-related ancestor we should replace
        let targetToReplace: Node = source;
        let curr = source.parentNode;
        while (curr && fragment.contains(curr)) {
          const name = curr.nodeName.toLowerCase();
          if (name === 'p' || name === 'li' || name === 'ul' || name === 'ol' || name === 'body' || name === 'div') break;
          if (name === 'ms-katex' || name === 'pre' || name === 'code' || (curr as Element).classList.contains('katex')) {
             targetToReplace = curr;
          }
          curr = curr.parentNode;
        }

        // --- SURGICAL DISPLAY DETECTION ---
        // 1. Check for explicit display="block" attribute on the math tag
        // 2. Check for .katex-display class
        const mathEl = (source.nodeName.toLowerCase() === 'math') ? source as Element : source.querySelector('math');
        const isDisplay = (mathEl?.getAttribute('display') === 'block') || 
                          (targetToReplace as Element).classList?.contains('display') || 
                          (targetToReplace as Element).querySelector?.('.katex-display') !== null;

        const wrapper = doc.createElement('latex-js');
        wrapper.textContent = latex;
        if (isDisplay) wrapper.setAttribute('data-display', 'true');
        
        // VAPORIZE the whole container (including ghosts inside it)
        if (targetToReplace.parentNode) {
          targetToReplace.parentNode.replaceChild(wrapper, targetToReplace);
        }
      }
    });

    // 2. [GLOBAL PURGE] Kill all remaining Katex/Google artifacts
    const toWipe = [
      '.katex-html', 
      '.katex-mathml', 
      'annotation', 
      'semantics', 
      'button', 
      'ms-tooltip', 
      'ms-katex', // Kill orphans
      'svg',
      '[class*="ng-content"]',
      'span[id*="zva"]'
    ];
    
    toWipe.forEach(sel => {
      fragment.querySelectorAll(sel).forEach(el => el.remove());
    });

    // 3. [STRUCTURAL FLATTENING] Flatten everything except safe blocks and our tag
    const toFlatten = Array.from(fragment.querySelectorAll('ms-cmark-node, span, div, pre, code'));
    toFlatten.forEach(node => {
      if (node.tagName.toLowerCase() === 'latex-js') return;
      
      // If it's a code block that DOES NOT contain math, keep it (handled by standard rules)
      if (node.tagName.toLowerCase() === 'pre' && node.querySelector('code')) return;

      const parent = node.parentNode;
      if (!parent) return;
      while (node.firstChild) {
        parent.insertBefore(node.firstChild, node);
      }
      parent.removeChild(node);
    });

    // 4. [NORMALIZATION] 
    const allPs = Array.from(fragment.querySelectorAll('p'));
    allPs.forEach(p => {
      if (p.firstChild?.nodeType === 3) {
        const text = p.firstChild.textContent || '';
        if (text.startsWith('- ')) p.firstChild.textContent = text.replace(/^- /, '【CC_BULLET】 ');
      }
      p.normalize();
      if (!p.textContent?.trim() && !p.querySelector('latex-js, img')) p.remove();
    });
  }

  public getTagsToKeep(): string[] {
    return ['latex-js'];
  }

  public getRules(): TurndownService.Rule[] {
    return [
      {
        filter: (node: Node) => node.nodeName.toLowerCase() === 'latex-js',
        replacement: (content: string, node: Node) => {
          const el = node as Element;
          const latex = el.textContent || '';
          const isDisplay = el.getAttribute('data-display') === 'true';
          return isDisplay ? `\n\n$$\n${latex}\n$$\n\n` : ` $${latex.trim()}$ `;
        }
      }
    ];
  }
}
