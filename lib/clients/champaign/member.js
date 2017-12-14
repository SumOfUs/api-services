import axios from 'axios';
import { integrationHeaders } from './utils';

const CHAMPAIGN_URL: string = process.env.CHAMPAIGN_URL || '';
const MEMBER_SERVICES_SECRET: string = process.env.MEMBER_SERVICES_SECRET || '';

const client = axios.create({
  baseURL: CHAMPAIGN_URL,
  headers: {
    ...integrationHeaders(MEMBER_SERVICES_SECRET),
  },
  maxRedirects: 0,
});

export function updateMember(member): Promise<*> {
  return client.put('/api/member_services/members/', {
    email: member.email,
    first_name: member.first_name,
    last_name: member.last_name,
    postal: member.postal,
    country: member.country,
  });
}
