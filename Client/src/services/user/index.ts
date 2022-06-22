import { axiosInstance } from '../';
import axios from 'axios';
import get from 'lodash/get';
import { v4 as uuidv4 } from 'uuid';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

export const UserService = {
  getAccessToken: async ({ secretKey, playerID, name }) => {
    try {
      const response = await axiosInstance.post('/gettoken', {
        secretKey,
        playerID,
        name,
      });

      const accessToken = get(response, 'data.data.accessToken');
      if (accessToken) {
        axiosInstance.setAuthorizationHeader(accessToken);
        // callback(accessToken);
        return Promise.resolve(accessToken);
      }
    } catch (error) {
      await UserService.getAccessToken({
        secretKey: uuidv4(),
        playerID: uuidv4(),
        name,
      });
    }
  },
  getProfile: async ({ playerID }) => {
    return axiosInstance.get(`http://localhost:3000/player/${playerID}`);
  },
  updateProfile: async (data: any) => {
    const { playerID, ...restData } = data;
    return axios.patch(`http://localhost:3000/player/${playerID}`, {
      ...restData,
    });
  },
  updateProfileBeacon: (data: any) => {
    const blob = new Blob([JSON.stringify(data)], {
      type: 'application/json',
    });
    window.navigator.sendBeacon(`${SERVER_URL}/player/${data.playerID}`, blob);
  },
};
