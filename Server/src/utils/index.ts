import crypto from 'crypto';

export default class Utils {
  static base64decode(data: any) {
    while (data.length % 4 !== 0) {
      data += '=';
    }
    data = data.replace(/-/g, '+').replace(/_/g, '/');
    return new Buffer(data, 'base64').toString('utf-8');
  }

  static parseSignedRequest(signedRequest: string, secret: string) {
    var encoded_data = signedRequest.split('.', 2); // decode the data
    var sig = encoded_data[0];
    var json = this.base64decode(encoded_data[1]);
    var data = JSON.parse(json);
    if (!data.algorithm || data.algorithm.toUpperCase() != 'HMAC-SHA256') {
      throw Error(
        'Unknown algorithm: ' + data.algorithm + '. Expected HMAC-SHA256',
      );
    }
    const expected_sig = crypto
      .createHmac('sha256', secret)
      .update(encoded_data[1])
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace('=', '');
    if (sig !== expected_sig) {
      throw Error('Invalid signature: ' + sig + '. Expected ' + expected_sig);
    }
    return data;
  }

  static randomNumber() {
    return crypto.randomBytes(10).toString('hex');
  }

  static toAbsoluteUrl(req: any, path: any) {
    return req.protocol + '://' + req.get('host') + path;
  }
}
