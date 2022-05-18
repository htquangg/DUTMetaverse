import { monitor } from '@colyseus/monitor';
import { SecurityPermission } from '../../helper';

export default [
  {
    path: '/colyseus',
    method: 'get',
    security: 'MIDDLEWARE' as SecurityPermission,
    handler: monitor(),
  },
];
