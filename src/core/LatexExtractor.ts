/**
 * Centralized logic for extracting raw LaTeX source from various
 * browser-rendered math formats (KaTeX, MathML, MathJax).
 */
export class LatexExtractor {
  /**
   * Attempts to extract LaTeX source from a given element.
   */
  public static extract(node: Element): string | null {
    // Stage 1: Look for standard Katex annotation
    const annotation = node.querySelector('annotation[encoding="application/x-tex"]');
    // Ensure we ONLY take the text content of the annotation element itself
    if (annotation) {
      return annotation.textContent?.trim() || null;
    }

    // Stage 2: Fallback to common math holders (legacy / other platforms)
    const scriptMath = node.querySelector('script[type^="math/tex"]');
    if (scriptMath) {
      return scriptMath.textContent?.trim() || null;
    }

    // Stage 3: Check for data-tex attribute (Used by Zhihu and some custom implementations)
    // First check the node itself, then children
    const dataTex = node.getAttribute('data-tex') || node.querySelector('[data-tex]')?.getAttribute('data-tex');
    if (dataTex) {
      return dataTex.trim();
    }

    // Stage 4: Check for Alt text (Wikipedia fallback)
    const mathImg = node.querySelector('img.mwe-math-fallback-image-inline, img.mwe-math-fallback-image-display');
    if (mathImg) {
      const alt = mathImg.getAttribute('alt');
      if (alt) return alt.trim();
    }

    return null;
  }

  /**
   * Determines if an element represents a LaTeX math block.
   */
  public static isMathNode(node: Node): node is Element {
    if (node.nodeType !== Node.ELEMENT_NODE) return false;
    const el = node as Element;
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
