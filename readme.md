### how to use 
| hotkey | command       |
| ------ | ------------- |
| ^+q    | copyHtml      |
| !+m    | copyMarkdown  |
| !+p    | copyPlainText |

### how to install
1. download the source code & extract to a folder `ChromeCopy/`
2. run `pnpm install` & `pnpm run build:webpack` in `ChromeCopy/`-> output (/generate) a `ChromeCopy/dist/` folder
   - (you can skip this step, if `ChromeCopy/dist/` folder is already provided (/generated) in the source code folder)
3. open Chrome browser > `chrome://extensions/` > `load unpacked` > select `ChromeCopy/`
4. press hotkey to copy text in webpage in desired format
