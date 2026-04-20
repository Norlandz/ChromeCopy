import { Logger } from './core/Logger';

// https://dev.to/paulasantamaria/adding-shortcuts-to-your-chrome-extension-2i20
chrome.commands.onCommand.addListener((command, tab) => {
  Logger.info(`Command received: ${command}`);

  if (command === 'copyHtml' || command === 'copyMarkdown' || command === 'copyPlainText') {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs[0]?.id) {
        await chrome.tabs.sendMessage(tabs[0].id, { command });
        Logger.debug(`Message sent to tab ${tabs[0].id}: ${command}`);
      }
    });
  } else {
    Logger.error(`Command ${command} not found`);
  }
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
