import { Express, Router } from 'express';

export type Wrapper = (router: Router) => void;

export const applyMiddleware = (
  middlewareWrappers: Wrapper[],
  express: Express,
) => {
  for (const wrapper of middlewareWrappers) {
    wrapper(express);
  }
};
