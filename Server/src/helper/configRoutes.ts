import { Express, Request, Response, NextFunction } from 'express';
import { AuthService } from '~/services/Auth';

export type Handler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void> | void;

export type SecurityPermission = 'UNPROTECTED' | 'PRIVATE' | 'MIDDLEWARE';

export type Route = {
  path: string;
  method: string;
  security: SecurityPermission;
  handler: Handler | Handler[];
};

export const applyRouteSet = (routeSets: Route[][], express: Express) => {
  for (const routeSet of routeSets) {
    applyRoutes(routeSet, express);
  }
};

export const applyRoutes = (routes: Route[], express: Express) => {
  for (const route of routes) {
    const { method, path, handler, security } = route;
    switch (security) {
      case 'UNPROTECTED':
        (express as any)[method](path, handler);
        break;
      case 'PRIVATE':
        (express as any)[method](path, AuthService.verifyAuthToken, handler);
        break;
      case 'MIDDLEWARE':
        (express as any).use(path, handler);
        break;
      default:
        break;
    }
  }
};
