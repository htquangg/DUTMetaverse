import axios, { AxiosInstance } from 'axios';

export class ApiService {
  #axiosInstance: AxiosInstance;

  constructor() {
    this.#axiosInstance = axios.create({
      timeout: 30000,
      baseURL: process.env.REACT_APP_SERVER_URL,
      headers: {
        Accept: 'application/json',
        'Content-type': 'application/json',
      },
    });
  }

  get(url: string, params = {}, moreConfigs = {}) {
    return this.#axiosInstance.get(url, { params, ...moreConfigs });
  }

  patch(url: string, data?: any, moreConfigs = {}) {
    return this.#axiosInstance.patch(url, data, moreConfigs);
  }

  post(url: string, data?: any, moreConfigs = {}) {
    return this.#axiosInstance.post(url, data, moreConfigs);
  }

  delete(url: string, params = {}, moreConfigs = {}) {
    return this.#axiosInstance.delete(url, { params, ...moreConfigs });
  }

  setAuthorizationHeader(token: string): void {
    this.#axiosInstance.defaults.headers['Authorization'] = `Bearer ${token}`;
  }

  getUserAccessToken(): string {
    return this.#axiosInstance.defaults.headers['Authorization'];
  }
}

export const axiosInstance = new ApiService();
