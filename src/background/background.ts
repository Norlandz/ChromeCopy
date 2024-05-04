// https://dev.to/paulasantamaria/adding-shortcuts-to-your-chrome-extension-2i20
chrome.commands.onCommand.addListener((command, tab) => {
  console.debug(command);
  if (command === 'copyHtml') {
  } else if (command === 'copyMarkdown') {
  } else if (command === 'copyPlainText') {
  } else {
    console.error(`Command ${command} not found`);
    return;
  }

  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    const id = tabs[0].id ?? (() => { throw new Error(); })(); // prettier-ignore
    const _ = await chrome.tabs.sendMessage(id, { command });
  });
});

// ;@pb[import cause background.js not working]; import 'chrome-types';
// ;@pb[import cause background.js not working];
// ;@pb[import cause background.js not working]; >"
// ;@pb[import cause background.js not working]; Using just import 'chrome'; instead of import { chrome } from 'chrome'; worked for me
// ;@pb[import cause background.js not working]; <>
// ;@pb[import cause background.js not working]; https://stackoverflow.com/questions/70539601/node-modules-types-chrome-index-d-ts-is-not-a-module/74820521#74820521
// ;@pb[import cause background.js not working];
// ;@pb[import cause background.js not working]; >"
// ;@pb[import cause background.js not working];     "types": ["chrome"]
// ;@pb[import cause background.js not working]; <>
// ;@pb[import cause background.js not working]; https://stackoverflow.com/questions/47075437/cannot-find-namespace-name-chrome
