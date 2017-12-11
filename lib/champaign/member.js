import axios from 'axios';
import request from 'superagent';
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
  // return request
  //   .put(`${CHAMPAIGN_URL}/api/member_services/members`)
  //   .set(integrationHeaders(MEMBER_SERVICES_SECRET))
  //   .set('Content-Type', 'application/json')
  //   .send(
  //     JSON.stringify({
  //       email: member.email,
  //       first_name: member.first_name,
  //       last_name: member.last_name,
  //       postal: member.postal,
  //       country: member.country,
  //     })
  //   );
  return client.put('/api/member_services/members/', {
    email: member.email,
    first_name: member.first_name,
    last_name: member.last_name,
    postal: member.postal,
    country: member.country,
  });
}
