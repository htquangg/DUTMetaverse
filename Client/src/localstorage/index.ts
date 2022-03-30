import { EncryptStorage } from 'encrypt-storage';

const SECRET_KEY = 'TG3wB9UzgztWx2';

export const TlqLocalStorage = new EncryptStorage(SECRET_KEY, {
  prefix: '@tlq',
});

