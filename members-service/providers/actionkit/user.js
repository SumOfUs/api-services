import { get } from 'axios-es6';
import {
  ok,
  notFound,
  badRequest,
} from '../../../shared/lambda-utils/responses';

const auth = {
  username: process.env.AK_USERNAME,
  password: process.env.AK_PASSWORD,
};

export function searchUser(filters) {
  return get(`${process.env.AK_API_URL}/user`, {
    auth: auth,
    params: { ...filters, limit: 1 },
  })
    .then(response => {
      const { data } = response;
      if (data.objects.length) {
        return ok({ cors: true, body: data });
      }
      return notFound({ cors: true });
    })
    .catch(response => {
      if (response.data) return badRequest({ cors: true, body: response.data });
      return Promise.reject(response);
    });
}
