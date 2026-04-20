import { MarkdownConverter } from './core/MarkdownConverter';
import { GoogleAIStudioAdapter } from './platforms/GoogleAIStudioAdapter';
import { WikipediaAdapter } from './platforms/WikipediaAdapter';
import { StackExchangeAdapter } from './platforms/StackExchangeAdapter';
import { MarkdownFormatter } from './core/MarkdownFormatter';

const converter = new MarkdownConverter();
converter.registerAdapter(new GoogleAIStudioAdapter());
converter.registerAdapter(new WikipediaAdapter());
converter.registerAdapter(new StackExchangeAdapter());

function getSelectionIncludingIframe(): Selection | null {
  let selection = window.getSelection();
  if (!selection || selection.type !== 'Range' || selection.rangeCount === 0) {
    const activeElement = document.activeElement;
    if (activeElement instanceof HTMLIFrameElement && activeElement.contentWindow) {
      selection = activeElement.contentWindow.getSelection();
    }
  }
  return selection;
}

import { Logger } from './core/Logger';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  void (async () => {
    const selection = getSelectionIncludingIframe();
    if (!selection) {
      Logger.warn('No selection found');
      return;
    }

    Logger.info(`Handling command: ${message.command}`);

    if (message.command === 'copyMarkdown') {
      const range = selection.getRangeAt(0);
      const fragment = range.cloneContents();
      
      let markdown = converter.convert(fragment, window.location.href);

      // Apply professional formatting via dedicated service
      markdown = await MarkdownFormatter.format(markdown);

      await navigator.clipboard.writeText(markdown);
      Logger.info('Markdown copied to clipboard');
    } else if (message.command === 'copyHtml') {
      const range = selection.getRangeAt(0);
      const container = document.createElement('div');
      container.appendChild(range.cloneContents());
      
      const html = container.innerHTML;
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([html], { type: 'text/plain' }), // Legacy: Use raw HTML for plain text slot
        })
      ]);
      Logger.info('HTML copied to clipboard (with raw HTML fallback)');
    } else if (message.command === 'copyPlainText') {
      await navigator.clipboard.writeText(selection.toString());
      Logger.info('Plain text copied to clipboard');
    }
  })();
  return undefined;
});
