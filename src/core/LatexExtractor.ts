import { Logger } from './Logger';
import { DomProcessor } from './DomProcessor';

/**
 * Centralized logic for extracting raw LaTeX source from various
 * browser-rendered math formats (KaTeX, MathML, MathJax).
 */
export class LatexExtractor {
  /**
   * Attempts to extract LaTeX source from a given element.
   */
  public static extract(node: Element): string | null {
    // Stage 1: Deep Recursive Search (The most robust method)
    const findSource = (root: Node): string | null => {
      if (!DomProcessor.isElement(root)) return null;
      const el = root;

      // Check 1: Standard Katex Annotation
      if (el.tagName.toLowerCase() === 'annotation' && el.getAttribute('encoding') === 'application/x-tex') {
        const tex = el.textContent?.trim();
        if (tex) return tex;
      }

      // Check 2: script math
      if (el.tagName.toLowerCase() === 'script' && el.getAttribute('type')?.startsWith('math/tex')) {
        return el.textContent?.trim() || null;
      }

      // Check 3: data-tex attribute
      const dataTex = el.getAttribute('data-tex');
      if (dataTex) return dataTex.trim();

      // Check 4: MathImg alt text
      if (el.tagName.toLowerCase() === 'img' && (el.classList.contains('mwe-math-fallback-image-inline') || el.classList.contains('mwe-math-fallback-image-display'))) {
        return el.getAttribute('alt')?.trim() || null;
      }

      // Descend
      const children = Array.from(root.childNodes);
      for (const child of children) {
        const found = findSource(child);
        if (found) {
          Logger.debug(`[LATEX-EXTRACTOR] Found: "${found}"`);
          return found;
        }
      }

      return null;
    };

    return findSource(node);
  }

  /**
   * Determines if an element represents a LaTeX math block.
   */
  public static isMathNode(node: Node): node is Element {
    if (!DomProcessor.isElement(node)) return false;
    const el = node;
    const tag = el.tagName.toLowerCase();
    
    return (
      tag === 'ms-katex' ||
      el.classList.contains('katex') ||
      el.classList.contains('MathJax') ||
      el.classList.contains('ztext-math') ||
      tag === 'math'
    );
  }
}
