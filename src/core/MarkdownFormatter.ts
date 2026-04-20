import prettier from 'prettier';
// @ts-ignore
import parserMarkdown from 'prettier/plugins/markdown';
import { Logger } from './Logger';

/**
 * Service for aesthetic cleanup and formatting of Markdown.
 * Decoupled from the conversion logic to allow independent evolution
 * of formatting rules.
 */
export class MarkdownFormatter {
  /**
   * Applies professional formatting and custom cleanup rules to a markdown string.
   */
  public static async format(markdown: string): Promise<string> {
    if (!markdown) return '';

    let result = markdown;

    // Phase 1: Custom Cleanup (e.g. redundant backslashes, extra spaces)
    // You can add legacy regex indicators here if needed.
    
    // Phase 2: Prettier Formatting
    try {
      result = await prettier.format(result, {
        parser: 'markdown',
        plugins: [parserMarkdown],
        printWidth: 100,
        proseWrap: 'always',
      });
    } catch (e) {
      Logger.warn('Prettier formatting failed, returning raw markdown', e);
    }

    return result.trim();
  }
}
