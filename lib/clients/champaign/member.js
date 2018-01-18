// @flow weak
import axios from 'axios';
import { integrationHeaders } from './utils';

const CHAMPAIGN_URL: string = process.env.CHAMPAIGN_URL || '';
const MEMBER_SERVICES_SECRET: string = process.env.MEMBER_SERVICES_SECRET || '';

const client = axios.create({
  baseURL: CHAMPAIGN_URL,
  headers: integrationHeaders(MEMBER_SERVICES_SECRET),
  maxRedirects: 0,
});

export function updateMember(email, params): Promise<*> {
  return client.put('/api/member_services/members/', {
    email: email,
    member: {
      email: params.email,
      first_name: params.first_name,
      last_name: params.last_name,
      postal: params.postal,
      country: params.country,
    },
  });
}
