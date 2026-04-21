import { IPlatformAdapter } from '../core/MarkdownConverter';
import { LatexExtractor } from '../core/LatexExtractor';
import TurndownService from 'turndown';

export class WikipediaAdapter implements IPlatformAdapter {
  public name = 'wikipedia';

  public matches(url: string): boolean {
    return url.includes('wikipedia.org');
  }

  public preprocess(fragment: DocumentFragment): void {
    // Wikipedia's structural nodes are usually fine, but we can add specific logic here if needed.
  }

  public getRules(): TurndownService.Rule[] {
    return [
      {
        filter: (node: Node) => {
          if (!(node instanceof Element)) return false;
          const el = node;
          // Wikipedia uses mwe-math-element classes
          return el.classList.contains('mwe-math-element') || el.classList.contains('mwe-math-fallback-image-inline');
        },
        replacement: (content: string, node: Node) => {
          if (!(node instanceof Element)) return content;
          const el = node;
          const latex = LatexExtractor.extract(el);
          const isDisplay = el.classList.contains('mwe-math-display') || 
                           el.closest('.mwe-math-element[display]') !== null;
          if (latex) {
            return isDisplay ? `\n\n$$\n${latex}\n$$\n\n` : ` $${latex}$ `;
          }
          return content;
        }
      }
    ];
  }
}
