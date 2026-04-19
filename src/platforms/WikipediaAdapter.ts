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
          return (node as Element).classList?.contains('mwe-math-element');
        },
        replacement: (content: string, node: Node) => {
          const latex = LatexExtractor.extract(node as Element);
          // Wikipedia usually doesn't distinguish inline/display in the tag name itself easily, 
          // but we can check for mwe-math-display class.
          const isDisplay = (node as Element).classList.contains('mwe-math-display');
          if (latex) {
            return isDisplay ? `\n\n$$\n${latex}\n$$\n\n` : ` $${latex}$ `;
          }
          return content;
        }
      }
    ];
  }
}
