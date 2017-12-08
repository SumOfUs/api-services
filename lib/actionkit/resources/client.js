import axios from 'axios';
import { basicAuthToken } from '../../util/basicAuthToken';

export const AKConfig = {
  baseURL: process.env.AK_API_URL || '',
  headers: {
    authorization: basicAuthToken(
      process.env.AK_USERNAME || '',
      process.env.AK_PASSWORD || ''
    ),
  },
};

// TODO: normalize things accross resources so we use only one
export const AKClient = axios.create(AKConfig);
export const IAKClient = axios.create(AKConfig);

IAKClient.interceptors.response.use(
  response => {
    return response.data;
  },
  error => {
    if (error.response) {
      // Response received with status not successful
      return Promise.reject(error.response.status);
    } else if (error.request) {
      // The request was made but no response was received
      return Promise.reject(error);
    } else {
      // Something happened in setting up the request that triggered an Error
      return Promise.reject(error.message);
    }
  }
);
