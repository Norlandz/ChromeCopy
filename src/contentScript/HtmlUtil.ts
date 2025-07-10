
export class HtmlUtil {
  // javascript - Converting HTML string into DOM elements? - Stack Overflow
  // https://stackoverflow.com/questions/3103962/converting-html-string-into-dom-elements
  //
  // javascript - Creating a new DOM element from an HTML string using built-in DOM methods or Prototype - Stack Overflow
  // https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro
  public static convert_htmlStr_to_elt(htmlStr: string): NodeListOf<ChildNode> {
    if (htmlStr == null) throw new Error('');
    const eltHolder = document.createElement('template'); // div
    eltHolder.innerHTML = htmlStr;
    return eltHolder.content.childNodes; // return eltHolder.content.children; // return eltHolder.childNodes;
  }

  public static get_list_textNode(node_root: Node, regexPatter_ExcludeTextNodeUnderThisTagName: RegExp | null = null, sel_ExcludeTextNodeUnderThisSelector: string | null = null): Text[] {
    const list_textNode: Text[] = [];
    const treeTraverseRecursive = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        list_textNode.push(node as Text);
      } else if (
        (regexPatter_ExcludeTextNodeUnderThisTagName != null && node.nodeType === Node.ELEMENT_NODE && regexPatter_ExcludeTextNodeUnderThisTagName.test((node as Element).tagName)) ||
        (sel_ExcludeTextNodeUnderThisSelector != null && node.nodeType === Node.ELEMENT_NODE && (node as Element).matches(sel_ExcludeTextNodeUnderThisSelector))
      ) {
        // @do_nothing skip all the node under <math>
        return;
      }
      for (const node_child of node.childNodes) {
        treeTraverseRecursive(node_child);
      }
    };
    treeTraverseRecursive(node_root);
    return list_textNode;
  }

  public static find_NextTextNode_Bfs(node: Node): Text | null {
    const node_Next = node.nextSibling;
    if (node_Next === null) {
      const node_Parent = node.parentNode;
      if (node_Parent === null) {
        return null;
      }
      return HtmlUtil.find_NextTextNode_Bfs(node_Parent);
    } else if (node_Next.nodeType === Node.TEXT_NODE) {
      return node_Next as Text;
    } else if (node_Next.nodeType === Node.ELEMENT_NODE) {
      const node_Next_Child = HtmlUtil.find_FirstTextNode_Bfs(node_Next);
      if (node_Next_Child == null) {
        return HtmlUtil.find_NextTextNode_Bfs(node_Next);
      } else {
        return node_Next_Child;
      }
    } else {
      return HtmlUtil.find_NextTextNode_Bfs(node_Next);
    }
  }

  public static find_FirstTextNode_Bfs(node: Node): Text | null {
    if (node.nodeType === Node.TEXT_NODE) {
      return node as Text;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      let node_Child = node.firstChild;
      while (node_Child) {
        if (node_Child.nodeType === Node.TEXT_NODE) {
          return node_Child as Text;
        } else if (node_Child.nodeType === Node.ELEMENT_NODE) {
          return HtmlUtil.find_FirstTextNode_Bfs(node_Child);
        } else {
          node_Child = node_Child.nextSibling;
        }
      }
      return null;
    } else {
      return null;
    }
  }

  // private static detm_NodeIs_Ele_Or_NonWhiteSpaceTextNode() {
  // }

  /**
  can do an insertion check + end insert check
  then find_Edge_moveUp_EnclosingParentElt
  then insert at that edge

  the pb is the mangling insertion outside of the scope...

  better do a final replace instead...
  @deprecated
  */
  public static find_Edge_moveUp_EnclosingParentElt(
    node: Node,
    direction: -1 | 1,
    regex_StopMovingUpAtTagName: RegExp | null = /^(div|p|li|ul|ol|td|table|dd|blockquote|section|article|body)$/i
  ): Node {
    if ((direction === -1 && node.previousSibling != null) || (direction === 1 && node.nextSibling != null)) {
      return node;
    }
    const node_Parent = node.parentNode;
    if (node_Parent == null) {
      return node;
    } else {
      if (regex_StopMovingUpAtTagName && node_Parent.nodeType === Node.ELEMENT_NODE && regex_StopMovingUpAtTagName.test((node_Parent as Element).tagName)) {
        return node_Parent;
      } else {
        return HtmlUtil.find_Edge_moveUp_EnclosingParentElt(node_Parent, direction);
      }
    }
  }

  public static move_elt_To_Edge(elt: HTMLElement): void {
    const elt_parentElement = elt.parentElement;
    if (elt_parentElement == null || elt_parentElement.nodeType === Node.DOCUMENT_NODE || /^(html|body)$/i.test(elt_parentElement.tagName)) {
      return;
    }

    const previousSibling = elt.previousSibling;
    const nextSibling = elt.nextSibling;
    if (previousSibling === null) {
      elt_parentElement.insertAdjacentElement('beforebegin', elt);
      HtmlUtil.move_elt_To_Edge(elt);
      return;
    }
    if (nextSibling === null) {
      elt_parentElement.insertAdjacentElement('afterend', elt);
      HtmlUtil.move_elt_To_Edge(elt);
      return;
    }
    if ((previousSibling.nodeType === Node.TEXT_NODE || previousSibling.nodeType === Node.ELEMENT_NODE) && previousSibling.textContent!.trim() === elt_parentElement.textContent!.trim()) {
      elt_parentElement.insertAdjacentElement('afterend', elt);
      HtmlUtil.move_elt_To_Edge(elt);
      return;
    } else if (nextSibling && (nextSibling.nodeType === Node.TEXT_NODE || nextSibling.nodeType === Node.ELEMENT_NODE) && nextSibling.textContent!.trim() === elt_parentElement.textContent!.trim()) {
      elt_parentElement.insertAdjacentElement('beforebegin', elt);
      HtmlUtil.move_elt_To_Edge(elt);
      return;
    }
  }

  public static changeTagName(document: Document, element: Element, newTagName: string) {
    // Create a new element with the desired tag name
    const newElement = document.createElement(newTagName);

    // Copy all attributes from the old element to the new element
    for (const attr of Array.from(element.attributes)) {
      newElement.setAttribute(attr.name, attr.value);
    }

    // // Copy all child nodes from the old element to the new element
    // while (element.firstChild) {
    //   newElement.appendChild(element.firstChild);
    // }
    // // Replace the old element with the new element in the DOM
    // element.parentNode.replaceChild(newElement, element);
    newElement.append(...element.childNodes);
    element.replaceWith(newElement);

    return newElement;
  }
}