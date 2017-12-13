import axios from 'axios';
import { pick as _pick } from 'lodash';

let baseURL;

if (process.env.GOCARDLESS_ENV == 'live')
  baseURL = 'https://api.gocardless.com/';
else baseURL = 'https://api-sandbox.gocardless.com/';

const http = axios.create({
  baseURL,
  headers: {
    Accept: 'application/json',
    Authorization: `Bearer ${process.env.GOCARDLESS_TOKEN}`,
    'GoCardless-Version': '2015-07-06',
  },
});

http.interceptors.response.use(
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

const getSubscription = id => {
  return http
    .get(`/subscriptions/${id}`)
    .then(data => {
      return buildSubscription(data.subscriptions);
    })
    .catch(error => {
      if (error === 404) throw 'NotFound';
      else throw error;
    });
};

const buildSubscription = subscription => {
  return {
    provider: 'gocardless',
    createdAt: subscription.created_at,
    startDate: subscription.start_date,
    amount: subscription.amount / 100,
    ..._pick(subscription, 'id', 'currency', 'status'),
  };
};

export { getSubscription };
