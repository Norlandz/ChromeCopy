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

  public static trimStructure(fragment: ParentNode): void {
    // Aggressively remove whitespace-only text nodes that sit between 
    // block-like elements or around math nodes, as these trigger Turndown newlines.
    const walker = document.createTreeWalker(fragment, NodeFilter.SHOW_TEXT);
    const nodesToRemove: Node[] = [];
    let node: Node | null = walker.nextNode();
    
    while (node) {
      if (node.textContent && node.textContent.trim() === '') {
        // If it's a whitespace node between a span and a math node, it's toxic
        const prev = node.previousSibling;
        const next = node.nextSibling;
        if (prev && next) {
           nodesToRemove.push(node);
        }
      }
      node = walker.nextNode();
    }
    nodesToRemove.forEach(n => n.remove());
  }
}
