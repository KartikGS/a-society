import express, { type Express, type Request, type Response } from 'express';
import { assertSafeStateSegment } from '../orchestration/state-paths.js';
import { listProjectRoles } from '../projects/project-roles.js';
import { loadProjectSettings, saveProjectSettings } from '../projects/project-settings-store.js';

function routeParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

function resolveProjectNamespace(req: Request, res: Response): string | null {
  try {
    return assertSafeStateSegment('project namespace', routeParam(req.params.projectNamespace));
  } catch (error: any) {
    res.status(400).json({ message: error instanceof Error ? error.message : String(error) });
    return null;
  }
}

export function registerProjectSettingsRoutes(app: Express): void {
  app.use(express.json());

  app.get('/api/projects/:projectNamespace/roles', (req: Request, res: Response) => {
    const projectNamespace = resolveProjectNamespace(req, res);
    if (projectNamespace === null) return;
    res.json(listProjectRoles(projectNamespace));
  });

  app.get('/api/projects/:projectNamespace/settings', (req: Request, res: Response) => {
    const projectNamespace = resolveProjectNamespace(req, res);
    if (projectNamespace === null) return;
    res.json(loadProjectSettings(projectNamespace));
  });

  app.put('/api/projects/:projectNamespace/settings', (req: Request, res: Response) => {
    const projectNamespace = resolveProjectNamespace(req, res);
    if (projectNamespace === null) return;
    try {
      res.json(saveProjectSettings(projectNamespace, req.body));
    } catch (error: any) {
      res.status(400).json({ message: error instanceof Error ? error.message : String(error) });
    }
  });
}
