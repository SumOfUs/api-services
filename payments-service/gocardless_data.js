import { validateRequest } from '../lib/request-validator';
import { ok, badRequest } from '../lib/lambda-utils/responses';
import { getGCCustomers } from '../lib/clients/champaign';
import { getSubscriptions } from '../lib/clients/gocardless';
import log from '../lib/logger';

const fetchCustomers = (email = 'omar@sumofus.org') => {
  getGCCustomers(email)
    .then(resp => {
      console.log(resp.data);
      fetchGcCustomer(resp.data);
    })
    .catch(err => {
      console.log('errrr', err);
    });
};

export const showFunc = (event, context, callback) => {
  fetchCustomers();
  callback(null, {});
};

export const show = log(showFunc);
