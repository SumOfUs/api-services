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

export function subjectAccessData(email): Promise<*> {
  console.log('EMAIL: ', email);
  return client.get('/api/member_services/subject_access_request/', {
    params: {
      email: email,
    },
  });
}
