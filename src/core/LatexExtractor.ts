/**
 * Centralized logic for extracting raw LaTeX source from various
 * browser-rendered math formats (KaTeX, MathML, MathJax).
 */
export class LatexExtractor {
  /**
   * Attempts to extract LaTeX source from a given element.
   */
  public static extract(element: Element): string | null {
    // 1. Check for KaTeX/MathML <annotation> tag (Gold standard)
    const annotation = element.querySelector('annotation[encoding="application/x-tex"]');
    if (annotation && annotation.textContent) {
      return annotation.textContent.trim();
    }

    // 2. Check for MathJax <script type="math/tex"> (Common in older sites)
    const mathJaxScript = element.querySelector('script[type="math/tex"]');
    if (mathJaxScript && mathJaxScript.textContent) {
      return mathJaxScript.textContent.trim();
    }

    // 3. Check for data-tex attribute (Used by Zhihu and some custom implementations)
    const dataTex = element.getAttribute('data-tex') || element.querySelector('[data-tex]')?.getAttribute('data-tex');
    if (dataTex) {
      return dataTex.trim();
    }

    // 4. Check for Alt text (Wikipedia fallback)
    const mathImg = element.querySelector('img.mwe-math-fallback-image-inline, img.mwe-math-fallback-image-display');
    if (mathImg && mathImg.getAttribute('alt')) {
      return mathImg.getAttribute('alt')?.trim() || null;
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
