import { LatexExtractor } from './LatexExtractor';
import type TurndownService from 'turndown';

const LATEX_SHIELD_CLASS = 'latex-js-shield';

const MATH_SOURCE_SELECTOR = [
  '[data-math-source]',
  'ms-katex',
  '.katex',
  '.katex-display',
  'math',
  'annotation[encoding="application/x-tex"]',
  'script[type^="math/tex"]',
  '[data-tex]',
  '.MathJax',
  '.math-container',
  '.mwe-math-element',
  '.mwe-math-fallback-image-inline',
  '.mwe-math-fallback-image-display',
  '.ztext-math',
].join(', ');

const MATH_CONTAINER_SELECTOR = [
  '[data-math-source]',
  '[role="math"]',
  'ms-katex',
  '.katex',
  '.katex-display',
  'math',
  '.MathJax',
  '.math-container',
  '.mwe-math-element',
  '.mwe-math-fallback-image-inline',
  '.mwe-math-fallback-image-display',
  '.ztext-math',
].join(', ');

/**
 * Site-agnostic math cleanup. It turns rendered math DOM into a simple shield
 * node that Turndown can convert without traversing noisy KaTeX/MathJax HTML.
 */
export class MathProcessor {
  public static shieldLatex(fragment: DocumentFragment): void {
    const doc = fragment.ownerDocument;
    const mathSources = Array.from(fragment.querySelectorAll(MATH_SOURCE_SELECTOR));

    mathSources.forEach(source => {
      if (!source.parentNode || !fragment.contains(source)) return;
      if (source.closest(`.${LATEX_SHIELD_CLASS}`)) return;
      if (this.isInsideLiteralCode(source)) return;
      if (this.isDuplicateSiblingMathScript(source)) {
        source.remove();
        return;
      }

      const latex = this.extractLatexWithSiblingFallback(source);
      if (!latex) return;

      const targetToReplace = this.findReplacementTarget(source, fragment);
      if (!targetToReplace.parentNode || !fragment.contains(targetToReplace)) return;

      const wrapper = doc.createElement('span');
      wrapper.className = LATEX_SHIELD_CLASS;
      wrapper.textContent = latex.trim();
      if (this.isDisplayMath(source, targetToReplace)) {
        wrapper.setAttribute('data-display', 'true');
      }

      targetToReplace.replaceWith(wrapper);
    });
  }

  public static getShieldRule(): TurndownService.Rule {
    return {
      filter: (node: Node) => {
        return (
          node.nodeName.toLowerCase() === 'span' &&
          (node as Element).classList.contains(LATEX_SHIELD_CLASS)
        );
      },
      replacement: (_content: string, node: Node) => {
        const el = node as Element;
        const latex = (el.textContent || '').trim();
        const isDisplay = el.getAttribute('data-display') === 'true';
        if (isDisplay) return `\n$$\n${latex}\n$$\n`;

        const prefix = this.needsInlinePaddingBefore(el) ? ' ' : '';
        const suffix = this.needsInlinePaddingAfter(el) ? ' ' : '';
        return `${prefix}$${latex}$${suffix}`;
      },
    };
  }

  private static extractLatexWithSiblingFallback(source: Element): string | null {
    const latex = LatexExtractor.extract(source);
    if (latex) return latex;

    if (source.classList.contains('MathJax') || source.classList.contains('math-container')) {
      const next = source.nextElementSibling;
      if (this.isMathScript(next)) {
        return next.textContent?.trim() || null;
      }
    }

    return null;
  }

  private static findReplacementTarget(source: Element, fragment: DocumentFragment): Element {
    // Prefer ChatGPT's semantic math wrapper. Its nested .katex element is
    // only the visual rendering and may not contain the source annotation.
    const semanticContainer = source.closest('[data-math-source], [role="math"]');
    if (semanticContainer && fragment.contains(semanticContainer)) return semanticContainer;

    const displayParent = source.closest('.katex-display');
    if (displayParent && fragment.contains(displayParent)) return displayParent;

    const container = source.closest(MATH_CONTAINER_SELECTOR);
    if (container && fragment.contains(container)) return container;

    return source;
  }

  private static isDisplayMath(source: Element, target: Element): boolean {
    const mathEl = source.nodeName.toLowerCase() === 'math' ? source : source.querySelector('math');
    const scriptType = source.getAttribute('type') || target.getAttribute('type') || '';
    const semanticContainer = source.closest('[data-math-source], [role="math"]');
    const semanticStyle = semanticContainer?.getAttribute('style') || '';

    return (
      mathEl?.getAttribute('display') === 'block' ||
      scriptType.includes('mode=display') ||
      source.classList.contains('display') ||
      source.classList.contains('katex-display') ||
      source.classList.contains('MathJax_Display') ||
      source.classList.contains('mwe-math-display') ||
      source.classList.contains('mwe-math-fallback-image-display') ||
      target.classList.contains('display') ||
      target.classList.contains('katex-display') ||
      target.classList.contains('ds-markdown-math') ||
      target.classList.contains('MathJax_Display') ||
      target.classList.contains('mwe-math-display') ||
      target.classList.contains('mwe-math-fallback-image-display') ||
      target.querySelector('.katex-display, .MathJax_Display') !== null ||
      /(?:^|;)\s*display\s*:\s*block\b/i.test(semanticStyle)
    );
  }

  private static isMathScript(node: Element | null): node is HTMLScriptElement {
    return node?.tagName.toLowerCase() === 'script' && node.getAttribute('type')?.startsWith('math/tex') === true;
  }

  private static isDuplicateSiblingMathScript(source: Element): boolean {
    return this.isMathScript(source) && source.previousElementSibling?.classList.contains(LATEX_SHIELD_CLASS) === true;
  }

  private static isInsideLiteralCode(source: Element): boolean {
    const codeAncestor = source.closest('pre, code');
    return codeAncestor !== null && source.closest('ms-katex, .katex, .katex-display') === null;
  }

  private static needsInlinePaddingBefore(node: Element): boolean {
    const text = this.getPreviousText(node);
    if (!text) return false;

    const last = text.at(-1) || '';
    return /[A-Za-z0-9_\])]$/.test(last);
  }

  private static needsInlinePaddingAfter(node: Element): boolean {
    const text = this.getNextText(node);
    if (!text) return false;

    const first = text.charAt(0);
    return /^[A-Za-z0-9_(]/.test(first);
  }

  private static getPreviousText(node: Node): string {
    let current: Node | null = node;

    while (current) {
      let previous = current.previousSibling;
      while (previous) {
        const text = this.getLastText(previous);
        if (text) return text;
        previous = previous.previousSibling;
      }
      current = current.parentNode;
      if (current?.nodeType === Node.DOCUMENT_FRAGMENT_NODE) break;
    }

    return '';
  }

  private static getNextText(node: Node): string {
    let current: Node | null = node;

    while (current) {
      let next = current.nextSibling;
      while (next) {
        const text = this.getFirstText(next);
        if (text) return text;
        next = next.nextSibling;
      }
      current = current.parentNode;
      if (current?.nodeType === Node.DOCUMENT_FRAGMENT_NODE) break;
    }

    return '';
  }

  private static getLastText(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent || '';

    const children = Array.from(node.childNodes);
    for (let i = children.length - 1; i >= 0; i -= 1) {
      const text = this.getLastText(children[i]);
      if (text) return text;
    }

    return '';
  }

  private static getFirstText(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent || '';

    const children = Array.from(node.childNodes);
    for (const child of children) {
      const text = this.getFirstText(child);
      if (text) return text;
    }

    return '';
  }
}
