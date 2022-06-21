import type { Player } from '@prisma/client';

export type Info = Pick<Player, 'playerID' | 'secretKey' | 'name'>;
