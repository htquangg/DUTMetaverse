import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '~/lib/prisma';
import ApiResponse from '~/utils/apiResponse';
import { ServiceConfig } from '~/config/ServiceConfig';
import { PlayerService } from '~/services/Player';
import type { Info } from './types';

async function getAuthToken(info: Info) {
  const playerInfo = await PlayerService.get(info);
  if (playerInfo) {
    if (playerInfo.secretKey !== info.secretKey) {
      return Promise.reject('Not match!!!');
    }
    const accessToken = jwt.sign(
      {
        playerID: info.playerID,
        secretKey: info.secretKey,
      },
      ServiceConfig.SECRET_KEY,
      { expiresIn: '30d' },
    );
    return Promise.resolve({ accessToken });
  } else {
    await PlayerService.create(info);
    const accessToken = jwt.sign(
      {
        playerID: info.playerID,
        secretKey: info.secretKey,
      },
      ServiceConfig.SECRET_KEY,
      { expiresIn: '30d' },
    );
    return Promise.resolve({ accessToken });
  }
}

async function verifyAuthToken(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(
      token,
      ServiceConfig.SECRET_KEY,
      async (error: any, player: any) => {
        if (error) {
          return ApiResponse.unauthorizedResponse(res, 'Unauthorized');
        }
        const playerInfo = await prisma.player.findUnique({
          where: {
            playerID: player.playerID,
          },
        });
        if (!playerInfo) {
          ApiResponse.outOfDateResponse(res, 'OutOfDate');
        }
        req.params.playerID = playerInfo!.playerID;
        req.params.secretKey = playerInfo!.secretKey;
        next();
      },
    );
  }
}

export { verifyAuthToken, getAuthToken };
