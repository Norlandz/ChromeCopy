import { window } from './env';
import { MarkdownConverter, IPlatformAdapter } from '../../core/MarkdownConverter';

/**
 * SHARED TEST EXECUTION LOGIC
 * ----------------------------
 * A clean, low-level wrapper to run the converter in a Node context.
 */

export function run_conversion(html: string, adapter: IPlatformAdapter, url: string): string {
  console.info('[TEST-INFO] Using shared global JSDOM context. Ensure document.body is cleared.');
  const converter = new MarkdownConverter();
  converter.registerAdapter(adapter);

  // [NUCLEAR STRING SWAP]
  // Turn P into DIV before parsing to prevent JSDOM from auto-closing paragraphs
  // that contain block-level math elements.
  const safeHtml = html.replace(/<p\b/g, '<div data-is-p="true"').replace(/<\/p>/g, '</div>');

  const doc = window.document;
  doc.body.innerHTML = safeHtml;
  
  // Convert body content to a fragment
  const fragment = doc.createDocumentFragment();
  while (doc.body.firstChild) {
    fragment.appendChild(doc.body.firstChild);
  }

  // Execute conversion
  return converter.convert(fragment, url);
}
