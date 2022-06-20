import { gameServer } from './server';
import { ServiceConfig } from './config/ServiceConfig';

const port = ServiceConfig.port;

console.log('[Server Config]: ', ServiceConfig);
gameServer.listen(port);
