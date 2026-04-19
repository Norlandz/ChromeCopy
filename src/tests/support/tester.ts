import './env';
import { MarkdownConverter, IPlatformAdapter } from '../../core/MarkdownConverter';

/**
 * SHARED TEST EXECUTION LOGIC
 * ----------------------------
 * A clean, low-level wrapper to run the converter in a Node context.
 */

export function run_conversion(html: string, adapter: IPlatformAdapter, url: string): string {
  const converter = new MarkdownConverter();
  converter.registerAdapter(adapter);

  // 1. Create fragment in the global JSDOM document
  const div = document.createElement('div');
  div.innerHTML = html.trim();
  
  const fragment = document.createDocumentFragment();
  while (div.firstChild) {
    fragment.appendChild(div.firstChild);
  }

  // 2. Execute conversion
  return converter.convert(fragment, url);
}
