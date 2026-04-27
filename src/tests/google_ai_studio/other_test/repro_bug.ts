import { dom, window } from '../../support/env';
import { GoogleAIStudioAdapter } from '../../../platforms/GoogleAIStudioAdapter';

const document = window.document;
const fragment = document.createDocumentFragment();

// Create a math element as a direct child of the fragment
const mathEl = document.createElement('math');
mathEl.innerHTML = '<semantics><annotation encoding="application/x-tex">E=mc^2</annotation></semantics>';
fragment.appendChild(mathEl);

const adapter = new GoogleAIStudioAdapter();

try {
    console.log('Running preprocess on fragment with direct math child...');
    adapter.preprocess(fragment);
    console.log('SUCCESS: Preprocess completed without error.');
    
    // Additional check: verify the child was replaced by the shield
    const shield = fragment.querySelector('.latex-js-shield');
    if (shield) {
        console.log('SUCCESS: Math element was correctly shielded.');
        console.log('Content:', shield.textContent);
    } else {
        console.log('FAILURE: Math element was not shielded.');
    }
} catch (e) {
    console.error('FAILURE: Preprocess crashed with error:');
    console.error(e);
    process.exit(1);
}
