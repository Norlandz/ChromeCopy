import TurndownService from 'turndown';
// @ts-ignore
import * as turndownPluginGfm from '@guyplusplus/turndown-plugin-gfm';
import { DomProcessor } from './DomProcessor';

const gfm = turndownPluginGfm.gfm;

export interface IPlatformAdapter {
  name: string;
  matches(url: string): boolean;
  preprocess(fragment: DocumentFragment): void;
  getRules(): TurndownService.Rule[];
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
    DomProcessor.normalizePreBlocks(fragment);

    // 2. Platform-specific Pre-processing
    activeAdapters.forEach(a => a.preprocess(fragment));

    // 3. Convert to HTML string for Turndown (ensuring it's treated as a block/fragment correctly)
    const container = document.createElement('div');
    container.appendChild(fragment.cloneNode(true));
    
    // 4. Conversion
    let markdown = this.turndownService.turndown(container.innerHTML);

    // 5. Final Cleanup (if any)
    return markdown.trim();
  }
}
