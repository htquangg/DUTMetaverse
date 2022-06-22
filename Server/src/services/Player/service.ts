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

async function get(info: Pick<Player, 'playerID'>) {
  try {
    const player = await prisma.player.findUnique({
      where: {
        playerID: info.playerID,
      },
    });
    return Promise.resolve(player);
  } catch (error) {
    return Promise.reject(error);
  }
}

async function create(
  info: WithRequired<Partial<Player>, 'playerID' | 'secretKey' | 'name'>,
) {
  try {
    let player = await initPlayer(info);
    player = await prisma.player.create({
      data: {
        ...player,
        ...info,
      },
    });
    return Promise.resolve(player);
  } catch (error) {
    return Promise.reject(error);
  }
}

async function update(info: WithRequired<Partial<Player>, 'playerID'>) {
  try {
    let player = await get(info);
    if (player) {
      const { id, ...restPlayer } = player;
      player = await prisma.player.update({
        where: {
          playerID: info.playerID,
        },
        data: {
          ...restPlayer,
          ...info,
        },
      });
      return Promise.resolve(player);
    }
  } catch (error) {
    return Promise.reject(error);
  }
}

export { get, create, update };
