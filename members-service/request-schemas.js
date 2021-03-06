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
  required: ['id', 'email', 'member'],
  properties: {
    email: { type: 'string', format: 'email' },
    id: { type: 'string', pattern: '^[0-9]+$' },
    member: {
      type: 'object',
      properties: {
        first_name: { type: 'string', minLength: 2 },
        last_name: { type: 'string', minLength: 2 },
        country: { type: 'string', minLength: 2 },
        postal: { type: 'string', minLength: 2 },
        email: { type: 'string', minLength: 2 },
      },
    },
  },
};

export const UNSUBSCRIBE_MEMBER_SCHEMA = {
  type: 'object',
  required: ['email', 'page'],
  properties: {
    email: { type: 'string', format: 'email' },
  },
};

export const SUBJECT_ACCESS_REQUEST_SCHEMA = {
  type: 'object',
  required: ['email'],
  properties: {
    email: { type: 'string', format: 'email' },
  },
};
