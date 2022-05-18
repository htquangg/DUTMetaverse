import { Request, Response } from 'express';
import { SecurityPermission } from '../../helper';
import Utils from '../../utils';
import ApiResponse from '../../utils/apiResponse';
import DataDeletionService from './dataDeletion';

export default [
  {
    path: '/auth/facebook/callback',
    method: 'post',
    security: 'UNPROTECTED' as SecurityPermission,
    handler: (req: Request, res: Response) => {
      const signedRequest = req.body['signed_request'];
      if (signedRequest) {
        DataDeletionService.parseSignedRequest(signedRequest)
          .then((data: any) => {
            const userId = data['user_id'];
            console.log(`Delete ${userId} from database!!!`);
            const confirmationCode = Utils.randomNumber();
            const path = `/auth/facebook/deletion-status?code=${confirmationCode}`;
            const url = Utils.toAbsoluteUrl(req, path);
            const payload = {
              url: `${url}`,
              confirmation_code: `${confirmationCode}`,
            };
            ApiResponse.successResponseWithData(req, res, payload);
          })
          .catch((error) => {
            ApiResponse.errorResponseWithData(req, res, error);
          });
      }
    },
  },
  {
    path: '/auth/facebook/deletion-status',
    method: 'get',
    security: 'UNPROTECTED' as SecurityPermission,
    handler: (req: Request, res: Response) => {
      const code = req.query.code;
      if (code) {
        console.log('FB deletion status: ', code);
        ApiResponse.successResponseWithData(req, res, { code });
      } else {
        ApiResponse.notFoundResponse(res);
      }
    },
  },
];
