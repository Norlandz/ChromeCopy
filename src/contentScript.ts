import { MarkdownConverter } from './core/MarkdownConverter';
import { GoogleAIStudioAdapter } from './platforms/GoogleAIStudioAdapter';
import { WikipediaAdapter } from './platforms/WikipediaAdapter';
import { StackExchangeAdapter } from './platforms/StackExchangeAdapter';
import prettier from 'prettier';
// @ts-ignore
import parserMarkdown from 'prettier/plugins/markdown';

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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  void (async () => {
    const selection = getSelectionIncludingIframe();
    if (!selection) return;

    if (message.command === 'copyMarkdown') {
      const range = selection.getRangeAt(0);
      const fragment = range.cloneContents();
      
      let markdown = converter.convert(fragment, window.location.href);

      // Apply prettier formatting for professional output
      try {
        markdown = await prettier.format(markdown, {
          parser: 'markdown',
          plugins: [parserMarkdown],
          printWidth: 100,
        });
      } catch (e) {
        console.warn('Prettier formatting failed, returning raw markdown', e);
      }

      await navigator.clipboard.writeText(markdown);
      console.log('Markdown copied to clipboard');
    } else if (message.command === 'copyHtml') {
      const range = selection.getRangeAt(0);
      const container = document.createElement('div');
      container.appendChild(range.cloneContents());
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([container.innerHTML], { type: 'text/html' }),
          'text/plain': new Blob([selection.toString()], { type: 'text/plain' }),
        })
      ]);
    } else if (message.command === 'copyPlainText') {
      await navigator.clipboard.writeText(selection.toString());
    }
  })();
  return undefined;
});
