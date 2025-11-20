import { copyFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const outDir = join(__dirname, '../docs');
const indexHtml = join(outDir, 'index.html');
const notFoundHtml = join(outDir, '404.html');

try {
  copyFileSync(indexHtml, notFoundHtml);
  console.log('✓ Created 404.html from index.html');
} catch (error) {
  console.error('Error copying index.html to 404.html:', error);
  process.exit(1);
}

