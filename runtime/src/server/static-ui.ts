import { type Express, type Request, type Response, static as expressStatic } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const UI_DIST = path.resolve(
  MODULE_DIR,
  MODULE_DIR.split(path.sep).includes('dist') ? '../../ui' : '../../dist/ui'
);
const UI_INDEX = path.join(UI_DIST, 'index.html');

export function registerStaticUi(app: Express): void {
  app.use(expressStatic(UI_DIST));
  app.get('*', (_req: Request, res: Response) => {
    if (!fs.existsSync(UI_INDEX)) {
      res.status(503).send('UI assets are not built. Run `npm run build:ui` in a-society/runtime/.');
      return;
    }
    res.sendFile(UI_INDEX);
  });
}
