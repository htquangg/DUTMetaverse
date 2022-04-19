export * from './debug';
export * from './createCustomCursorKeys';

import CryptoJs from 'crypto-js';

const SECRET_KEY = '76S73DGt5WqTYk';

export default class Utils {
  // The ID must start and end with an alphanumeric character (lower or upper case character or a digit). In the middle of the ID spaces, dashes (-) and underscores (_) are allowed.
  static replaceInvalidID(id: string) {
    return id.replace(/[^0-1a-z]/gi, 'G');
  }

  static encryptID(id: string) {
    return CryptoJs.AES.encrypt(id, SECRET_KEY);
  }

  static decryptID(encryptID: string) {
    return CryptoJs.AES.decrypt(encryptID, SECRET_KEY);
  }

  static formatEncryptID(id: string): string {
    return 'cc' + Utils.encryptID(id);
  }

  // Thanks yannick @ https://phaser.discourse.group/t/loading-audio/1306/4
  static asyncLoader(loaderPlugin): Promise {
    return new Promise((resolve, reject) => {
      loaderPlugin.on('filecomplete', resolve).on('loaderror', reject);
      loaderPlugin.start();
    });
  }
}
