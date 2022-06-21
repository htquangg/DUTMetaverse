import { Request, Response } from 'express';
import ApiResponse from '~/utils/apiResponse';
import { SecurityPermission } from '~/helper/';
import { AuthService } from '.';
import { Info } from './types';

export default [
  {
    path: '/gettoken',
    method: 'post',
    security: 'UNPROTECTED' as SecurityPermission,
    handler: (req: Request, res: Response) => {
      const info: Info = {
        playerID: req.body.playerID,
        secretKey: req.body.secretKey,
        name: req.body.name ? req.body.name : '',
      };
      AuthService.getAuthToken(info)
        .then((data) => {
          ApiResponse.successResponseWithData(req, res, data);
        })
        .catch((error) => {
          ApiResponse.errorResponseWithData(req, res, error);
        });
    },
  },
];
