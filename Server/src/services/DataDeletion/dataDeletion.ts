import { ServiceConfig } from '../../config/ServiceConfig';
import Utils from '../../utils';

export default class DataDeletionService {
  static parseSignedRequest(signedRequest: string) {
    return new Promise((resolve, reject) => {
      try {
        const fbSecretKey = ServiceConfig.fbSecretKey;
        const data = Utils.parseSignedRequest(signedRequest, fbSecretKey);
        if (data) {
          resolve(data);
        }
      } catch (error) {
        return reject(error);
      }
    });
  }
}
