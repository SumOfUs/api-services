import axios from 'axios';
import { integrationHeaders } from './utils';
import crypto from 'crypto';

const CHAMPAIGN_URL: string = process.env.CHAMPAIGN_URL || '';
const MEMBER_SERVICES_SECRET: string = process.env.MEMBER_SERVICES_SECRET || '';

const client = axios.create({
  baseURL: CHAMPAIGN_URL,
  headers: {
    ...integrationHeaders(MEMBER_SERVICES_SECRET),
  },
  maxRedirects: 0,
});

export function cancelRecurringDonation(recurringId, provider): Promise<*> {
  console.log(
    'Called cancel recurring donation with id ',
    recurringId,
    ' and provider',
    provider
  );
  return client.delete(
    `/api/member_services/recurring_donations/${provider}/${recurringId}`,
    {}
  );
}
