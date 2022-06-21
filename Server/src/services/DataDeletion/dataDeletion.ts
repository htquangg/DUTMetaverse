import { ServiceConfig } from '../../config/ServiceConfig';
import Utils from '../../utils';

export default class DataDeletionService {
  static parseSignedRequest(signedRequest: string) {
    return new Promise((resolve, reject) => {
      try {
        const data = Utils.parseSignedRequest(
          signedRequest,
          ServiceConfig.FB_SECRET_KEY,
        );
        if (data) {
          resolve(data);
        }
      } catch (error) {
        return reject(error);
      }
    });
  }
}
