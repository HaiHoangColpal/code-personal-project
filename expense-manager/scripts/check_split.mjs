import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const MAX_CHUNK = 380 * 1024;
const html = readFileSync('C:/NodeJS/test_form_personal/dist/index.html', 'utf-8');
const jsMatch = html.match(/<script[^>]*>([\s\S]*?)<\/script>/);
const js = jsMatch ? jsMatch[1] : '';

console.log('JS length:', js.length);
if (js.length > MAX_CHUNK) {
  console.log('Split point:', js.substring(MAX_CHUNK - 20, MAX_CHUNK + 20));
}
