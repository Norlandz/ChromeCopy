import { JSDOM } from 'jsdom';
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

  // Use a completely fresh JSDOM instance for the input to avoid tag-stripping
  const dom = new JSDOM(html);
  const body = dom.window.document.body;
  
  // Convert body content to a fragment
  const fragment = dom.window.document.createDocumentFragment();
  while (body.firstChild) {
    fragment.appendChild(body.firstChild);
  }

  // Execute conversion
  return converter.convert(fragment, url);
}
