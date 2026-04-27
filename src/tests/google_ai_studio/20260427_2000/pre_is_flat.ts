import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { run_conversion } from '../../support/tester';
import { GoogleAIStudioAdapter } from '../../../platforms/GoogleAIStudioAdapter';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// const htmlPath = path.join(__dirname, 'main_test/complex_2.html');
const htmlPath = path.join(__dirname, 'pre_is_flat.html');
const html = fs.readFileSync(htmlPath, 'utf8');

import { MarkdownFormatter } from '../../../core/MarkdownFormatter';

const adapter = new GoogleAIStudioAdapter();
const url = 'https://aistudio.google.com/'; 

const rawMarkdown = run_conversion(html, adapter, url);
const formattedMarkdown = await MarkdownFormatter.format(rawMarkdown);

console.log(formattedMarkdown);
