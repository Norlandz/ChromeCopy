import { IPlatformAdapter } from '../core/MarkdownConverter';
import { LatexExtractor } from '../core/LatexExtractor';
import { MathProcessor } from '../core/MathProcessor';
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
    this.normalizeInlineCode(fragment);
    this.normalizeCodeBlocks(fragment);
    this.shieldLatex(fragment);
  }

  public getRules(): TurndownService.Rule[] {
    return [MathProcessor.getShieldRule()];
  }

  private normalizeInlineCode(fragment: DocumentFragment): void {
    const doc = fragment.ownerDocument;

    fragment.querySelectorAll('[data-markdown-copy="inline-code"]').forEach(source => {
      if (!fragment.contains(source)) return;

      const code = doc.createElement('code');
      while (source.firstChild) code.appendChild(source.firstChild);
      source.replaceWith(code);
    });
  }

  private normalizeCodeBlocks(fragment: DocumentFragment): void {
    const doc = fragment.ownerDocument;
    const codeBlockContainers = Array.from(
      fragment.querySelectorAll('pre, [data-markdown-copy="code-block"]'),
    );

    codeBlockContainers.forEach(container => {
      if (!fragment.contains(container)) return;

      // ChatGPT has used both a CodeMirror `<pre class="cm-content"><code>`
      // layout and a newer `<div class="cm-content"><div class="cm-line">`
      // layout inside a `<pre>`, as well as a code-block container with no
      // outer `<pre>` at all. Normalize all of them before Turndown sees the
      // editor chrome and line elements as ordinary page content.

      // @to_ai: DO NOT REMOVE or change this comment block!
      // relying on a cheap short selector will only cause safety problem later, be specific.
      const code = container.matches('pre.cm-content')
        ? container
        : container.querySelector('.cm-content') ||
          container.querySelector('div.text-size-chat > code[class~="whitespace-pre!"]') ||
          container.querySelector('.chatgpt-code-scrollport > pre > code');
      if (!code) return;

      const replacementPre = doc.createElement('pre');
      const replacementCode = doc.createElement('code');
      const language = this.getCodeBlockLanguage(container, code);
      if (language) {
        replacementCode.className = `language-${language}`;
      }
      replacementCode.textContent = this.getTextWithLineBreaks(code).replace(/\n+$/g, '');
      replacementPre.appendChild(replacementCode);
      container.replaceWith(replacementPre);
    });
  }

  private getCodeBlockLanguage(container: Element, code: Element): string {
    const language = code.getAttribute('data-language')?.trim().toLowerCase();
    if (language) return this.normalizeLanguage(language);

    const titleElement = Array.from(container.querySelectorAll('.sticky div')).find(el => {
      const text = (el.textContent || '').trim();
      return text.length > 0 && el.classList.contains('text-token-text-primary');
    });

    const legacyLanguage = (titleElement?.textContent || '').trim().toLowerCase();
    if (legacyLanguage) return this.normalizeLanguage(legacyLanguage);

    // The newer ChatGPT toolbar exposes the language in a truncate label,
    // while the editor itself normally carries the more reliable data-language.
    const toolbarLabel = container.querySelector(
      '[data-markdown-copy="exclude"] .flex-1.truncate',
    );
    const toolbarLanguage = (toolbarLabel?.textContent || '').trim().toLowerCase();
    return this.normalizeLanguage(toolbarLanguage);
  }

  private normalizeLanguage(language: string): string {
    if (language === 'plain text' || language === 'plaintext') return 'text';
    return language;
  }

  private shieldLatex(fragment: DocumentFragment): void {
    const doc = fragment.ownerDocument;
    const mathSources = Array.from(fragment.querySelectorAll('[data-math-source], [role="math"], .katex, math'));

    mathSources.forEach(source => {
      if (!source.parentNode || !fragment.contains(source)) return;

      const latex = LatexExtractor.extract(source);
      if (!latex) return;

      let targetToReplace: Element = source;
      const semanticContainer = source.closest('[data-math-source], [role="math"]');
      const displayParent = source.closest('.katex-display');
      const katexParent = source.closest('.katex');
      if (semanticContainer && fragment.contains(semanticContainer)) {
        targetToReplace = semanticContainer;
      } else if (displayParent && fragment.contains(displayParent)) {
        targetToReplace = displayParent;
      } else if (katexParent && fragment.contains(katexParent)) {
        targetToReplace = katexParent;
      }

      const mathEl = source.nodeName.toLowerCase() === 'math' ? source : source.querySelector('math');
      const isDisplay =
        mathEl?.getAttribute('display') === 'block' ||
        targetToReplace.classList.contains('katex-display') ||
        targetToReplace.querySelector('.katex-display') !== null ||
        /(?:^|;)\s*display\s*:\s*block\b/i.test(targetToReplace.getAttribute('style') || '');

      const wrapper = doc.createElement('span');
      wrapper.className = 'latex-js-shield';
      wrapper.textContent = latex.trim();
      if (isDisplay) wrapper.setAttribute('data-display', 'true');

      targetToReplace.replaceWith(wrapper);
    });
  }

  private getTextWithLineBreaks(parentNode: Node): string {
    const lineElements = parentNode instanceof Element
      ? Array.from(parentNode.querySelectorAll('.cm-line'))
      : [];

    if (lineElements.length > 0) {
      return lineElements
        .map(line => this.getTextFromNode(line, false).replace(/\r?\n[\t ]*/g, ' '))
        .join('\n');
    }

    return this.getTextFromNode(parentNode, true);
  }

  private getTextFromNode(parentNode: Node, preserveBreakElements: boolean): string {
    let text = '';

    parentNode.childNodes.forEach(child => {
      if (child.nodeType === Node.TEXT_NODE) {
        text += child.textContent || '';
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const element = child as Element;
        if (element.nodeName === 'BR') {
          if (preserveBreakElements) text += '\n';
        } else {
          text += this.getTextFromNode(element, preserveBreakElements);
        }
      }
    });

    return text;
  }
}
