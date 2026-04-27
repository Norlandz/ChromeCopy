import { IPlatformAdapter } from '../core/MarkdownConverter';
import { LatexExtractor } from '../core/LatexExtractor';
import TurndownService from 'turndown';

export class StackExchangeAdapter implements IPlatformAdapter {
  public name = 'stack-exchange';

  public matches(url: string): boolean {
    return (
      url.includes('stackexchange.com') ||
      url.includes('stackoverflow.com') ||
      url.includes('mathoverflow.net') ||
      url.includes('serverfault.com') ||
      url.includes('superuser.com')
    );
  }

  public preprocess(fragment: DocumentFragment): void {
    // StackExchange often has duplicate math nodes (one for screen readers, one for display).
    // We should ensure we don't process the same math twice.
  }

  public getRules(): TurndownService.Rule[] {
    return [
      {
        filter: (node: Node) => {
          const el = node as Element;
          // StackExchange uses MathJax. We match on the container or the script itself.
          return el.classList?.contains('MathJax') || 
                 el.classList?.contains('math-container') ||
                 (el.tagName.toLowerCase() === 'script' && el.getAttribute('type') === 'math/tex');
        },
        replacement: (content: string, node: Node) => {
          const el = node as HTMLElement;
          
          // If we matched the script, and it has a preceding MathJax holder, 
          // we ignore the script to avoid duplication (the holder rule will handle it).
          if (el.tagName.toLowerCase() === 'script') {
            const prev = el.previousElementSibling;
            if (prev && (prev.classList.contains('MathJax') || prev.classList.contains('math-container'))) {
              return '';
            }
          }

          let latex = LatexExtractor.extract(el);
          
          // StackExchange special: if node is MathJax span, source is often in NEXT sibling script
          if (!latex && (el.classList.contains('MathJax') || el.classList.contains('math-container'))) {
            const nextMatch = el.nextElementSibling;
            if (nextMatch && nextMatch.tagName.toLowerCase() === 'script' && nextMatch.getAttribute('type') === 'math/tex') {
              latex = nextMatch.textContent?.trim() || null;
            }
          }

          if (latex) {
            const isDisplay = el.classList.contains('MathJax_Display') || 
                             el.querySelector('.MathJax_Display') !== null;
            return isDisplay ? `\n\n$$\n${latex}\n$$\n\n` : ` $${latex}$ `;
          }
          return content;
        }
      }
    ];
  }
}
