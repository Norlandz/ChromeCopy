// import 'chrome-types';

import TurndownService from 'turndown';
const turndownService = new TurndownService();

// >"
//   var win = iframe.contentWindow;
//   var doc = win.document;
//
//   if (win.getSelection) {
// <>
// https://stackoverflow.com/questions/1471759/how-to-get-selected-text-from-iframe-with-javascript
//
// >"
// how to get currently selected iframe
// ChatGPT
// To get the currently selected iframe in a web page using JavaScript, you can use the document.activeElement property. Here's how you can do it:
// <>
// https://www.autohotkey.com/docs/v1/Variables.htm

function get_seletion_includingIframe() {
  let selectionText = window.getSelection();
  console.debug(selectionText);

  if (selectionText == null || selectionText.type !== 'Range' || selectionText.rangeCount === 0) {
    console.debug('no selection, go check iframe');
    selectionText = get_seletion_insideIframe();
    console.debug(selectionText);
  }
  return selectionText;
}

// @todo recursive iframe
function get_seletion_insideIframe() {
  const elt_active = document.activeElement;
  // if (/^iframe$/i.test(elt_active.tagName)) {
  //  && elt_active.tagName.toUpperCase() === 'IFRAME'
  if (!(elt_active instanceof HTMLIFrameElement)) {
    console.debug('not an iframe. - so there is really no text selection?');
    return null;
  }
  console.debug(elt_active);
  const win = elt_active.contentWindow;
  if (win == null) {
    console.error('iframe.contentWindow is null, idk why');
    return null;
  }
  return win.getSelection();
}

function convert_selection_to_html(selectionText: Selection): string {
  const range = selectionText.getRangeAt(0);
  const clonedSelection = range.cloneContents();
  const div = document.createElement('div');
  div.appendChild(clonedSelection);
  return div.innerHTML;
}

// https://stackoverflow.com/questions/14245334/sendmessage-from-extension-background-or-popup-to-content-script-doesnt-work
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  void (async () => {
    const selectionText = get_seletion_includingIframe();

    if (message.command === 'copyHtml') {
      const html = selectionText == null ? '' : convert_selection_to_html(selectionText);
      // G:\UsingTemp\copycat\src\utils\write-html-to-clipboard.ts
      // const blob = textToBlob(html, mimeType)
      // Javascript - Copy string to clipboard as text/html - Stack Overflow
      // https://stackoverflow.com/questions/34191780/javascript-copy-string-to-clipboard-as-text-html
      // dk why chrome sometimes need see clipboard
      const mimeType_html = 'text/html';
      const mimeType_plain = 'text/plain';
      const clipboardItem = new ClipboardItem({
        [mimeType_html]: new Blob([html], { type: mimeType_html }),
        [mimeType_plain]: new Blob([html], { type: mimeType_plain }),
      });
      // Uncaught (in promise) DOMException: Failed to execute 'writeText' on 'Clipboard': Document is not focused.
      await navigator.clipboard.write([clipboardItem]);
    } else if (message.command === 'copyMarkdown') {
      // G:\UsingTemp\copycat\src\utils\convert-html-to-markdown.ts
      // G:\UsingTemp\copycat\src\utils\write-text-to-clipboard.ts
      const html = selectionText == null ? '' : convert_selection_to_html(selectionText);
      const markdown = turndownService.turndown(html);
      await navigator.clipboard.writeText(markdown);
    } else if (message.command === 'copyPlainText') {
      const txt = selectionText == null ? '' : selectionText.toString();
      await navigator.clipboard.writeText(txt);
    }
  })();

  // >"
  // Note return true; in the listener: this tells the browser that you intend to use the sendResponse argument after the listener has returned.
  // <>
  // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage#sending_an_asynchronous_response_using_sendresponse
  // return true;
  //
  // Uncaught (in promise) Error: A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received
  return undefined;
});

// >"
//  that this happened because I want to send a message to a page which does not have contentScript.js.
// <>
// https://stackoverflow.com/questions/71848934/uncaught-in-promise-error-could-not-establish-connection-receiving-end-does
//
// >"
//     "module": "commonjs",
// <>
// https://stackoverflow.com/questions/58273824/typescript-cannot-use-import-statement-outside-a-module
// >"
//     // "module": "ESNext",
//     "module": "CommonJS",
// <>
// G:\Using\ChromeCopy\tsconfig.json

//
// >"
// The best way would be to use bundlers like webpack or Rollup.
//
// I got away with basic configuration
//
// const path = require('path');
//
// module.exports = {
//   entry: {
//     background: './background.js',
//     content: './content.js',
//   },
//   output: {
//     filename: '[name].js',
//     path: path.resolve(__dirname, '../build')
//   }
// };
// <>
// https://stackoverflow.com/questions/48104433/how-to-import-es6-modules-in-content-script-for-chrome-extension

// ;tsconfig for tsc no webpack; {
// ;tsconfig for tsc no webpack;   "compilerOptions": {
// ;tsconfig for tsc no webpack;     "lib": [
// ;tsconfig for tsc no webpack;       "DOM",
// ;tsconfig for tsc no webpack;       "DOM.Iterable",
// ;tsconfig for tsc no webpack;       "ES2022",
// ;tsconfig for tsc no webpack;     ],
// ;tsconfig for tsc no webpack;     "target": "ES2020",
// ;tsconfig for tsc no webpack;     "module": "ESNext",
// ;tsconfig for tsc no webpack;     // "module": "CommonJS",
// ;tsconfig for tsc no webpack;     "useDefineForClassFields": true,
// ;tsconfig for tsc no webpack;     "skipLibCheck": true,
// ;tsconfig for tsc no webpack;     /* Bundler mode */
// ;tsconfig for tsc no webpack;     "moduleResolution": "bundler",
// ;tsconfig for tsc no webpack;     "resolveJsonModule": true,
// ;tsconfig for tsc no webpack;     "isolatedModules": true,
// ;tsconfig for tsc no webpack;     // "noEmit": true, // this prevents the dist folder ...
// ;tsconfig for tsc no webpack;     // "allowImportingTsExtensions": true,
// ;tsconfig for tsc no webpack;     "jsx": "react-jsx",
// ;tsconfig for tsc no webpack;     /* Linting */
// ;tsconfig for tsc no webpack;     "strict": true,
// ;tsconfig for tsc no webpack;     "noImplicitAny": true,
// ;tsconfig for tsc no webpack;     "noFallthroughCasesInSwitch": true,
// ;tsconfig for tsc no webpack;     // "noUnusedLocals": true,
// ;tsconfig for tsc no webpack;     // "noUnusedParameters": true,
// ;tsconfig for tsc no webpack;     //
// ;tsconfig for tsc no webpack;     "esModuleInterop": true,
// ;tsconfig for tsc no webpack;     "allowSyntheticDefaultImports": true,
// ;tsconfig for tsc no webpack;     //
// ;tsconfig for tsc no webpack;     "experimentalDecorators": true,
// ;tsconfig for tsc no webpack;     "emitDecoratorMetadata": true,
// ;tsconfig for tsc no webpack;     //
// ;tsconfig for tsc no webpack;     "sourceMap": true,
// ;tsconfig for tsc no webpack;     // "composite": true,
// ;tsconfig for tsc no webpack;     "declaration": true,
// ;tsconfig for tsc no webpack;     "declarationMap": true,
// ;tsconfig for tsc no webpack;     //
// ;tsconfig for tsc no webpack;     // "rootDir": ".",
// ;tsconfig for tsc no webpack;     "outDir": "dist",
// ;tsconfig for tsc no webpack;     //
// ;tsconfig for tsc no webpack;     "allowJs": true,
// ;tsconfig for tsc no webpack;     //
// ;tsconfig for tsc no webpack;     "noErrorTruncation": true, // https://stackoverflow.com/questions/53113031/how-to-see-a-fully-expanded-typescript-type-without-n-more-and
// ;tsconfig for tsc no webpack;     //
// ;tsconfig for tsc no webpack;     "types": [
// ;tsconfig for tsc no webpack;       "chrome-types"
// ;tsconfig for tsc no webpack;     ]
// ;tsconfig for tsc no webpack;   },
// ;tsconfig for tsc no webpack;   "include": [
// ;tsconfig for tsc no webpack;     "src/**/*",
// ;tsconfig for tsc no webpack;     "test/**/*",
// ;tsconfig for tsc no webpack;     "Globals.d.ts",
// ;tsconfig for tsc no webpack;     "vite.config.ts",
// ;tsconfig for tsc no webpack;     "jest.config.js",
// ;tsconfig for tsc no webpack;   ],
// ;tsconfig for tsc no webpack;   "exclude": [
// ;tsconfig for tsc no webpack;     "node_modules",
// ;tsconfig for tsc no webpack;     "**/node_modules/**/*",
// ;tsconfig for tsc no webpack;     "**/.git/**/*",
// ;tsconfig for tsc no webpack;   ],
// ;tsconfig for tsc no webpack; }
// npx tsc --project ./tsconfig.json --watch

// Chrome extension with Typescript. Google Chrome extensions are programs… | by Kien Duong | Medium
// https://medium.com/@doublekien/chrome-extension-with-typescript-1589aa84e80
