export const FILTER_MEMBERS_SCHEMA = {
  type: 'object',
  anyOf: [
    { required: ['email'] },
    { required: ['last_name__iexact', 'country__iexact'] },
  ],
  properties: {
    email: {
      type: 'string',
      format: 'email',
    },
    last_name__iexact: {
      type: 'string',
      minLength: 2,
    },
    country__iexact: {
      type: 'string',
      minLength: 2,
    },
  },
};
export const SHOW_MEMBER_SCHEMA = {
  type: 'object',
  required: ['id'],
  properties: {
    id: {
      type: 'number',
    },
  },
};

export const UPDATE_MEMBER_SCHEMA = {
  type: 'object',
  required: ['id'],
  properties: {
    id: {
      type: 'number',
    },
  },
};
