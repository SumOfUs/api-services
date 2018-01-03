// @flow

export type Collection<T> = {
  meta: {
    next: ?string,
    previous: ?string,
    limit: number,
    offset: number,
    total_count: number,
  },
  objects: Array<T>,
};

export type UserFields = {
  en: string,
  express_account: string,
  express_cookie: string,
  fr: string,
  multichannel_exp161209: string,
};

export type UserCollection = Collection<User>;

export type User = {
  actions: string,
  address1: string,
  address2: string,
  city: string,
  country: string,
  created_at: string,
  email: string,
  events: string,
  eventsignups: string,
  fields: UserFields,
  first_name: string,
  id: number,
  lang: string,
  last_name: string,
  location: string,
  logintoken: string,
  middle_name: string,
  orderrecurrings: string,
  orders: string,
  phones: any[],
  plus4: string,
  postal: string,
  prefix: string,
  rand_id: number,
  region: string,
  resource_uri: string,
  source: string,
  state: string,
  subscription_status: string,
  subscriptionhistory: string,
  subscriptions: string,
  suffix: string,
  token: string,
  updated_at: string,
  usergeofields: string,
  usermailings: string,
  useroriginal: string,
  zip: string,
};
export type IUserUpdate = {
  address1: string,
  address2: string,
  city: string,
  country: string,
  created_at: string,
  email: string,
  fields: UserFields,
  first_name: string,
  last_name: string,
  middle_name: string,
  phones: any[],
  plus4: string,
  postal: string,
  prefix: string,
  region: string,
  source: string,
  state: string,
  subscription_status: string,
  suffix: string,
  zip: string,
};