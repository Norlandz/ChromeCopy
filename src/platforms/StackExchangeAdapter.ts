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
          return el.classList?.contains('MathJax') || el.classList?.contains('math-container');
        },
        replacement: (content: string, node: Node) => {
          // Look for the source script tag next to the MathJax element if not inside
          let latex = LatexExtractor.extract(node as Element);
          
          if (!latex) {
             const script = (node as Element).querySelector('script[type="math/tex"]') || 
                           (node as Element).nextElementSibling;
             if (script && script.tagName.toLowerCase() === 'script' && script.getAttribute('type') === 'math/tex') {
               latex = script.textContent?.trim() || null;
             }
          }

          if (latex) {
            // Check if it's a block display (often denoted by MathJax_Display class)
            const isDisplay = (node as Element).classList.contains('MathJax_Display') || 
                             (node as Element).querySelector('.MathJax_Display') !== null;
            return isDisplay ? `\n\n$$\n${latex}\n$$\n\n` : ` $${latex}$ `;
          }
          return content;
        }
      },
      {
        // Ignore the raw math scripts themselves to avoid duplication
        filter: (node: Node) => {
          return node.nodeName.toLowerCase() === 'script' && (node as Element).getAttribute('type') === 'math/tex';
        },
        replacement: () => ''
      }
    ];
  }
}
