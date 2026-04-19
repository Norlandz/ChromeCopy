import { JSDOM } from 'jsdom';

/**
 * SHARED TEST ENVIRONMENT SETUP
 * ----------------------------
 * Initializes the global DOM context required by the core logic.
 */

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  contentType: 'text/html',
});

const { window } = dom;

global.document = window.document;
global.Node = window.Node as any;
global.Element = window.Element as any;
global.HTMLElement = window.HTMLElement as any;
global.DocumentFragment = window.DocumentFragment as any;
global.HTMLTemplateElement = window.HTMLTemplateElement as any;
global.NodeFilter = (window as any).NodeFilter;

export { dom, window };
