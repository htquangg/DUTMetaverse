import prisma from '~/lib/prisma';
import ObjectID from 'bson-objectid';
import type { Player } from '@prisma/client';

async function initPlayer(
  info: Pick<Player, 'playerID' | 'secretKey' | 'name'>,
) {
  const { playerID, secretKey, name } = info;
  const player: Player = {
    playerID,
    secretKey,
    name,
    id: ObjectID().toHexString(),
    x: 768,
    y: 1440,
  };
  return player;
}

async function create(info: Pick<Player, 'playerID' | 'secretKey' | 'name'>) {
  try {
    let player = await initPlayer(info);

    player = await prisma.player.create({
      data: player,
    });

    return Promise.resolve(player);
  } catch (error) {
    return Promise.reject(error);
  }
}

export { create };
