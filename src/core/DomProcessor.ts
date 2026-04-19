/**
 * Specialized utilities for cleaning and normalizing DOM trees
 * before conversion to Markdown.
 */
export class DomProcessor {
  /**
   * Recursively strips specific wrapper tags while preserving their children.
   * This is crucial for Google AI Studio which nests almost everything in <ms-cmark-node>.
   */
  public static flattenCustomWrappers(fragment: ParentNode, tagsToStrip: string[] = ['ms-cmark-node']): void {
    const selector = tagsToStrip.join(', ');
    if (!selector) return;

    let wrapper: Element | null;
    // We use a loop and querySelector because stripping one might expose another
    // or change the tree in a way that static NodeLists would miss.
    while ((wrapper = fragment.querySelector(selector))) {
      const parent = wrapper.parentNode;
      if (parent) {
        // Move all children out of the wrapper
        while (wrapper.firstChild) {
          parent.insertBefore(wrapper.firstChild, wrapper);
        }
        // Remove the empty wrapper
        wrapper.remove();
      } else {
        // Fallback for when the wrapper is the root of the fragment
        // We can't remove it from parent, but we can replace it with a DocFrag
        const docFrag = document.createDocumentFragment();
        docFrag.append(...wrapper.childNodes);
        wrapper.replaceWith(docFrag);
      }
    }
  }

  /**
   * Normalizes <pre> elements inside custom tags that Turndown might misinterpret.
   */
  public static normalizePreBlocks(fragment: ParentNode): void {
    // Google AI Studio puts <pre> inside <ms-katex>. 
    // Turndown's default rules often treat <pre> as a block, even if it's "inline" math.
    // We convert these to <span> to hint Turndown to treat them as phrasing content.
    const katexPres = fragment.querySelectorAll('ms-katex.inline pre');
    katexPres.forEach(pre => {
      const span = document.createElement('span');
      span.setAttribute('data-was-pre', 'true');
      span.append(...pre.childNodes);
      pre.replaceWith(span);
    });
  }

  /**
   * Cleans up whitespace-only text nodes that can cause Turndown to insert unwanted newlines.
   */
  public static trimStructure(fragment: ParentNode): void {
     // Implementation can follow if specific issues persist
  }
}
