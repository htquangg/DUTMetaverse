import { axiosInstance } from '../';
import axios from 'axios';
import get from 'lodash/get';
import { v4 as uuidv4 } from 'uuid';

export const UserService = {
  getAccessToken: async (
    { secretKey, playerID, name },
    callback: (...args: any[]) => void,
  ) => {
    try {
      const response = await axiosInstance.post('/gettoken', {
        secretKey,
        playerID,
        name,
      });

      console.log('response: ', response);

      const accessToken = get(response, 'data.data.accessToken');
      if (accessToken) {
        axiosInstance.setAuthorizationHeader(accessToken);
        callback(accessToken);
      }
    } catch (error) {
      await UserService.getAccessToken(
        { secretKey: uuidv4(), playerID: uuidv4(), name },
        callback,
      );
    }
  },
};
