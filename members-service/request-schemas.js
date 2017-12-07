export const LIST_MEMBERS_SCHEMA = {
  type: 'object',
  required: ['email'],
  properties: {
    email: { type: 'string', format: 'email' },
    last_name__iexact: { type: 'string', minLength: 2 },
    country__iexact: { type: 'string', minLength: 2 },
  },
};

export const SHOW_MEMBER_SCHEMA = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string', pattern: '^[0-9]+$' },
  },
};

export const UPDATE_MEMBER_SCHEMA = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string', pattern: '^[0-9]+$' },
    email: { type: 'string', format: 'email' },
    first_name: { type: 'string', minLength: 2 },
    last_name: { type: 'string', minLength: 2 },
    country: { type: 'string', minLength: 2 },
    postal: { type: 'string', minLength: 2 },
  },
};

export const UNSUBSCRIBE_MEMBER_SCHEMA = {
  type: 'object',
  required: ['email', 'page'],
  properties: {
    email: { type: 'string', format: 'email' },
    page: { type: 'string', minLength: 1 },
  },
};
