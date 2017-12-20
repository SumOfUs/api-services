import axios from 'axios';
import uuid from 'uuid/v1';
import crypto from 'crypto';

const nonce = uuid();

const signature = crypto
  .createHmac('sha256', process.env.MEMBER_SERVICES_SECRET)
  .update(nonce)
  .digest('hex');

const http = axios.create({
  baseURL: `${process.env.CHAMPAIGN_URL}/api/member_services/`,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-CHAMPAIGN-NONCE': nonce,
    'X-CHAMPAIGN-SIGNATURE': signature,
  },
});

export const getGCCustomers = email => {
  return http.get('/gocardless/customers', {
    params: {
      email: email,
    },
  });
};
