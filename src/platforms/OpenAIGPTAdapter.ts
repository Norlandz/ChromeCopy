import { IPlatformAdapter } from '../core/MarkdownConverter';
import { LatexExtractor } from '../core/LatexExtractor';
import TurndownService from 'turndown';

export class OpenAIGPTAdapter implements IPlatformAdapter {
  public name = 'openai-gpt';

  public matches(url: string): boolean {
    try {
      const hostname = new URL(url).hostname;
      return (
        hostname === 'chatgpt.com' ||
        hostname.endsWith('.chatgpt.com') ||
        hostname === 'chat.openai.com'
      );
    } catch {
      return url.includes('chatgpt.com') || url.includes('chat.openai.com');
    }
  }

  public preprocess(fragment: DocumentFragment): void {
    this.normalizeCodeBlocks(fragment);
    this.shieldLatex(fragment);
  }

  public getRules(): TurndownService.Rule[] {
    return [
      {
        filter: (node: Node) => {
          return (
            node.nodeName.toLowerCase() === 'span' &&
            (node as Element).classList.contains('latex-js-shield')
          );
        },
        replacement: (_content: string, node: Node) => {
          const el = node as Element;
          const latex = (el.textContent || '').trim();
          const isDisplay = el.getAttribute('data-display') === 'true';
          return isDisplay ? `\n$$\n${latex}\n$$\n` : `$${latex}$`;
        },
      },
    ];
  }

  private normalizeCodeBlocks(fragment: DocumentFragment): void {
    const doc = fragment.ownerDocument;
    const preBlocks = Array.from(fragment.querySelectorAll('pre'));

    preBlocks.forEach(pre => {
      if (!fragment.contains(pre)) return;

      const code = pre.querySelector('.cm-content code');
      if (!code) return;

      const replacementPre = doc.createElement('pre');
      const replacementCode = doc.createElement('code');
      const language = this.getCodeBlockLanguage(pre);
      if (language) {
        replacementCode.className = `language-${language}`;
      }
      replacementCode.textContent = this.getTextWithLineBreaks(code).replace(/\n+$/g, '');
      replacementPre.appendChild(replacementCode);
      pre.replaceWith(replacementPre);
    });
  }

  private getCodeBlockLanguage(pre: Element): string {
    const stickyHeader = pre.querySelector('.sticky');
    if (!stickyHeader) return '';

    const titleElement = Array.from(stickyHeader.querySelectorAll('div')).find(el => {
      const text = (el.textContent || '').trim();
      return text.length > 0 && el.classList.contains('text-token-text-primary');
    });

    const language = (titleElement?.textContent || '').trim().toLowerCase();
    return language === 'text' ? '' : language;
  }

  private shieldLatex(fragment: DocumentFragment): void {
    const doc = fragment.ownerDocument;
    const mathSources = Array.from(fragment.querySelectorAll('.katex, math'));

    mathSources.forEach(source => {
      if (!source.parentNode || !fragment.contains(source)) return;

      const latex = LatexExtractor.extract(source);
      if (!latex) return;

      let targetToReplace: Element = source;
      const displayParent = source.closest('.katex-display');
      const katexParent = source.closest('.katex');
      if (displayParent && fragment.contains(displayParent)) {
        targetToReplace = displayParent;
      } else if (katexParent && fragment.contains(katexParent)) {
        targetToReplace = katexParent;
      }

      const mathEl = source.nodeName.toLowerCase() === 'math' ? source : source.querySelector('math');
      const isDisplay =
        mathEl?.getAttribute('display') === 'block' ||
        targetToReplace.classList.contains('katex-display') ||
        targetToReplace.querySelector('.katex-display') !== null;

      const wrapper = doc.createElement('span');
      wrapper.className = 'latex-js-shield';
      wrapper.textContent = latex.trim();
      if (isDisplay) wrapper.setAttribute('data-display', 'true');

      targetToReplace.replaceWith(wrapper);
    });
  }

  private getTextWithLineBreaks(parentNode: Node): string {
    let text = '';

    parentNode.childNodes.forEach(child => {
      if (child.nodeType === Node.TEXT_NODE) {
        text += child.textContent || '';
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const element = child as Element;
        if (element.nodeName === 'BR') {
          text += '\n';
        } else {
          text += this.getTextWithLineBreaks(element);
        }
      }
    });

    return text;
  }
}
