import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { run_conversion } from '../../support/tester';
import { OpenAIGPTAdapter } from '../../../platforms/OpenAIGPTAdapter';
import { MarkdownFormatter } from '../../../core/MarkdownFormatter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const htmlPath = path.join(__dirname, '20260929_1531-general.html');
const html = fs.readFileSync(htmlPath, 'utf8');

const adapter = new OpenAIGPTAdapter();
const url = 'https://chatgpt.com/';

const rawMarkdown = run_conversion(html, adapter, url);
const formattedMarkdown = await MarkdownFormatter.format(rawMarkdown);

console.log(formattedMarkdown);
