import { Logger } from './Logger';

/**
 * Specialized utilities for cleaning and normalizing DOM trees
 * before conversion to Markdown.
 */
export class DomProcessor {
  /**
   * Cross-realm safe type guard for Elements.
   * Logs an error if a realm mismatch is detected (nodeType matches but instanceof fails).
   */
  public static isElement(node: Node | null): node is Element {
    if (!node) return false;
    const isElem = node.nodeType === Node.ELEMENT_NODE;
    // Realm Sentinel: detect when JSDOM instances are mixed in tests
    if (isElem && !(node instanceof Element)) {
      Logger.error('[DOM-REALM-MISMATCH] Node is an Element (type 1), but instanceof Element is false. Test environment is likely using multiple JSDOM instances.');
    }
    return isElem;
  }

  /**
   * Cross-realm safe type guard for Text nodes.
   */
  public static isText(node: Node | null): node is Text {
    if (!node) return false;
    return node.nodeType === Node.TEXT_NODE;
  }

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
        const docFrag = (wrapper.ownerDocument || document).createDocumentFragment();
        docFrag.append(...Array.from(wrapper.childNodes));
        wrapper.replaceWith(docFrag);
      }
    }
  }


  public static trimStructure(fragment: ParentNode): void {
    // Aggressively remove whitespace-only text nodes that sit between 
    // block-like elements or around math nodes, as these trigger Turndown newlines.
    const walker = (fragment.ownerDocument || document as any).createTreeWalker(fragment, NodeFilter.SHOW_TEXT);
    const nodesToRemove: Node[] = [];
    let node: Node | null = walker.nextNode();
    
    while (node) {
      if (this.isText(node) && node.textContent?.trim() === '') {
        // Never strip whitespace inside pre/code: those spaces matter for code formatting.
        // (LaTeX <pre> tags don't exist yet at this stage — they get shielded later.)
        let ancestor = node.parentNode;
        let insidePre = false;
        while (ancestor && ancestor !== (fragment as unknown as Node)) {
          if (this.isElement(ancestor)) {
            const tag = ancestor.nodeName.toLowerCase();
            if (tag === 'pre' || tag === 'code') { insidePre = true; break; }
          }
          ancestor = ancestor.parentNode;
        }
        if (!insidePre) {
          const prev = node.previousSibling;
          const next = node.nextSibling;
          if (prev && next) nodesToRemove.push(node);
        }
      }
      node = walker.nextNode();
    }
    nodesToRemove.forEach(n => {
      if (this.isElement(n)) n.remove();
      else n.parentNode?.removeChild(n);
    });
  }
}
