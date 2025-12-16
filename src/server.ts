import { AngularAppEngine } from '@angular/ssr';

const engine = new AngularAppEngine();

export const handler = (request: Request) => engine.handle(request);
