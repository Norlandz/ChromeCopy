import './../support/env';
import { JSDOM } from 'jsdom';
import { GoogleAIStudioAdapter } from '../../platforms/GoogleAIStudioAdapter';

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
const document = dom.window.document;
const fragment = document.createDocumentFragment();

// Create a structure that triggers the upward traversal to the fragment root
const span = document.createElement('span');
span.className = 'katex';
const math = document.createElement('math');
span.appendChild(math);
fragment.appendChild(span);

const adapter = new GoogleAIStudioAdapter();

console.log('Running adapter.preprocess(fragment)...');
try {
    adapter.preprocess(fragment);
    console.log('SUCCESS: No crash!');
} catch (e: any) {
    console.error('FAILURE: Crashed with error:', e.message);
    process.exit(1);
}
