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
    // Crucial fix: strip the custom wrapper tags that break DOM flow and cause weird line breaks
    DomProcessor.flattenCustomWrappers(fragment, ['ms-cmark-node']);
  }

  public getRules(): TurndownService.Rule[] {
    return [
      {
        filter: (node: Node) => {
          return node.nodeName.toLowerCase() === 'ms-katex' && (node as Element).classList.contains('inline');
        },
        replacement: (content: string, node: Node) => {
          const latex = LatexExtractor.extract(node as Element);
          return latex ? ` $${latex}$ ` : content;
        }
      },
      {
        filter: (node: Node) => {
          return node.nodeName.toLowerCase() === 'ms-katex' && (node as Element).classList.contains('display');
        },
        replacement: (content: string, node: Node) => {
          const latex = LatexExtractor.extract(node as Element);
          return latex ? `\n\n$$\n${latex}\n$$\n\n` : content;
        }
      },
      {
        filter: (node: Node) => {
          return node.nodeName.toLowerCase() === 'span' && (node as Element).classList.contains('inline-code');
        },
        replacement: (content: string) => {
          return ` \`${content.trim()}\` `;
        }
      }
    ];
  }
}
