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

    // 1. [SHIELDING] Replace math with a pure inline span
    const mathSources = Array.from(fragment.querySelectorAll('ms-katex, math, .katex'));
    
    mathSources.forEach(source => {
      if (!source.parentNode || !fragment.contains(source)) return;

      const latex = LatexExtractor.extract(source as Element);
      if (latex) {
        let targetToReplace: Node = source;
        let curr: ParentNode | null = source.parentNode;
        while (curr && fragment.contains(curr)) {
          const name = curr.nodeName.toLowerCase();
          if (['p', 'li', 'ul', 'ol', 'body', 'div', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(name)) break;
          if (['ms-katex', 'pre', 'code', 'math', 'semantics'].includes(name) || (curr as Element).classList.contains('katex')) {
             targetToReplace = curr;
          }
          curr = curr.parentNode;
        }

        const mathEl = (source.nodeName.toLowerCase() === 'math') ? source as Element : source.querySelector('math');
        const isDisplay = (mathEl?.getAttribute('display') === 'block') || 
                          (targetToReplace as Element).classList?.contains('display') || 
                          (targetToReplace as Element).querySelector?.('.katex-display') !== null;

        const wrapper = doc.createElement('span');
        wrapper.className = 'latex-js-shield';
        wrapper.textContent = latex.trim();
        if (isDisplay) wrapper.setAttribute('data-display', 'true');
        
        if (targetToReplace.parentNode) {
          targetToReplace.parentNode.replaceChild(wrapper, targetToReplace);
        }
      }
    });

    // 2. [STRUCTURAL RECONSTRUCTION] Rebuild the fragment with zero whitespace noise
    const cleanFragment = doc.createDocumentFragment();

    const processNode = (node: Node, target: Node) => {
      if (node.nodeType === 3) {
        // [NUCLEAR TRIM] Kill all newlines and multiple spaces
        const text = (node.textContent || '').replace(/[\n\r\t]+/g, ' ').replace(/\s+/g, ' ');
        if (text === ' ' && (target.childNodes.length === 0 || target.lastChild?.nodeName === 'BR')) return;
        if (text === ' ' && target.lastChild?.nodeType === 3 && target.lastChild.textContent?.endsWith(' ')) return;
        
        target.appendChild(doc.createTextNode(text));
        return;
      }

      if (node.nodeType !== 1) return;
      const el = node as Element;
      const tagName = el.tagName.toLowerCase();

      // CASE A: Math - Preserve Nesting
      if (tagName === 'span' && el.classList.contains('latex-js-shield')) {
        target.appendChild(el.cloneNode(true));
        return;
      }

      // CASE B: Safe Structural Tags
      const safeTags = ['p', 'ul', 'ol', 'li', 'strong', 'em', 'b', 'i', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'br', 'hr', 'blockquote', 'img', 'pre', 'code'];
      const isPseudoP = tagName === 'div' && el.getAttribute('data-is-p') === 'true';
      
      if (safeTags.includes(tagName) || isPseudoP) {
        const finalTagName = isPseudoP ? 'p' : tagName;
        const newEl = doc.createElement(finalTagName);
        if (tagName === 'img') newEl.setAttribute('src', el.getAttribute('src') || '');
        target.appendChild(newEl);
        Array.from(el.childNodes).forEach(child => processNode(child, newEl));
        return;
      }

      // CASE C: Flatten Wrappers (Removed 'pre' and 'code' from here)
      if (['span', 'ms-cmark-node', 'div'].includes(tagName)) {
        Array.from(el.childNodes).forEach(child => processNode(child, target));
      }
    };

    Array.from(fragment.childNodes).forEach(node => processNode(node, cleanFragment));
    while (fragment.firstChild) fragment.removeChild(fragment.firstChild);
    fragment.appendChild(cleanFragment);

    // 3. [POST-PROCESS] Final Polish
    const allPs = Array.from(fragment.querySelectorAll('p'));
    allPs.forEach(p => {
      p.normalize();
      // Remove trailing spaces inside P
      if (p.lastChild?.nodeType === 3) {
        p.lastChild.textContent = p.lastChild.textContent?.trimRight() || '';
      }
      if (!p.textContent?.trim() && !p.querySelector('.latex-js-shield, img')) p.remove();
    });
  }

  public getRules(): TurndownService.Rule[] {
    return [
      {
        filter: (node: Node) => node.nodeName.toLowerCase() === 'span' && (node as Element).classList.contains('latex-js-shield'),
        replacement: (_content: string, node: Node) => {
          const el = node as Element;
          const latex = el.textContent || '';
          const isDisplay = el.getAttribute('data-display') === 'true';
          // Clean Rule: No manual \n\n hacks. Fences are enough for block identification.
          return isDisplay ? `\n$$\n${latex.trim()}\n$$\n` : `$${latex.trim()}$`;
        }
      }
    ];
  }
}
