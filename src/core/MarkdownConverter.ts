import TurndownService from 'turndown';
// @ts-ignore
import * as turndownPluginGfm from '@guyplusplus/turndown-plugin-gfm';
import { DomProcessor } from './DomProcessor';

const gfm = turndownPluginGfm.gfm;

function getTextWithLineBreaks(parentNode: Node): string {
  let text = '';
  parentNode.childNodes.forEach((child: Node) => {
    if (child.nodeType === 3) {
      text += child.textContent;
    } else if (child.nodeType === 1) {
      const element = child as HTMLElement;
      if (element.nodeName === 'BR') {
        text += '\n';
      } else {
        text += getTextWithLineBreaks(element);
      }
    }
  });
  return text;
}

export interface IPlatformAdapter {
  name: string;
  matches(url: string): boolean;
  preprocess(fragment: DocumentFragment): void;
  getRules(): TurndownService.Rule[];
  getTagsToKeep?(): string[];
}

export class MarkdownConverter {
  private turndownService: TurndownService;
  private adapters: IPlatformAdapter[] = [];

  constructor() {
    this.turndownService = new TurndownService({
      headingStyle: 'atx',
      hr: '---',
      bulletListMarker: '-',
      codeBlockStyle: 'fenced',
      fence: '```',
      emDelimiter: '_',
      strongDelimiter: '**',
      linkStyle: 'inlined',
    });

    this.turndownService.use(gfm);

    // Global Recovery: Restore legacy PRE block rules
    this.turndownService.addRule('pre_block', {
      filter: (node, options) => {
        // [CRITICAL] Do not process PRE if it is part of a math block
        if ((node as Element).closest('ms-katex, .katex, math')) return false;
        return !!(options.codeBlockStyle === 'fenced' && node.nodeName === 'PRE' && node.firstElementChild && node.firstElementChild.nodeName !== 'CODE');
      },
      replacement: (content, node) => {
        return '\n\n```\n' + getTextWithLineBreaks(node) + '\n```\n\n';
      },
    });

    this.turndownService.addRule('preCodeBlock', {
      filter: (node, options) => {
        // [CRITICAL] Do not process PRE if it is part of a math block
        if ((node as Element).closest('ms-katex, .katex, math')) return false;
        return !!(options.codeBlockStyle === 'fenced' && node.nodeName === 'PRE' && node.firstElementChild && node.firstElementChild.nodeName === 'CODE');
      },
      replacement: (content, node, options) => {
        const eltCode = node.firstElementChild as HTMLElement;
        const className = eltCode.getAttribute('class') || '';
        const language = (className.match(/language-(\S+)/) || [null, ''])[1];
        const code = eltCode.textContent ?? '';
        
        const fenceChar = options.fence?.charAt(0) || '`';
        let fenceSize = 3;
        const fenceInCodeRegex = new RegExp('^' + fenceChar + '{3,}', 'gm');
        let match;
        while ((match = fenceInCodeRegex.exec(code))) {
          if (match[0].length >= fenceSize) {
            fenceSize = match[0].length + 1;
          }
        }
        const fence = Array(fenceSize + 1).join(fenceChar);
        return '\n\n' + fence + language + '\n' + code.replace(/\n$/, '') + '\n' + fence + '\n\n';
      },
    });
  }

  public registerAdapter(adapter: IPlatformAdapter): void {
    this.adapters.push(adapter);
    adapter.getRules().forEach(rule => {
      this.turndownService.addRule(`${adapter.name}_${Math.random().toString(36).substr(2, 5)}`, rule);
    });
  }

  public convert(fragment: DocumentFragment, url: string): string {
    const activeAdapters = this.adapters.filter(a => a.matches(url));

    // 1. General Pre-processing
    DomProcessor.trimStructure(fragment);

    // 2. Platform-specific Pre-processing
    activeAdapters.forEach(a => {
      a.preprocess(fragment);
      if (a.getTagsToKeep) {
        this.turndownService.keep(a.getTagsToKeep());
      }
    });

    // 3. Convert to HTML string for Turndown
    const container = document.createElement('div');
    container.appendChild(fragment.cloneNode(true));
    
    console.log('--- DEBUG: CLEANED HTML BEFORE TURNDOWN ---');
    console.log(container.innerHTML);
    console.log('-------------------------------------------');

    // 4. Conversion - Pass the Node directly to preserve custom element tagging
    let markdown = this.turndownService.turndown(container);

    // 5. Post-Conversion Cleanup
    // (Removed legacy regex scrubbing of RF-RGI-CB and CC_BULLET markers)

    return markdown.trim();
  }
}
