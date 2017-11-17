import { ok } from '../shared/lambda-utils/responses';

export const handler = (event, context, callback) => {
  callback(
    null,
    ok({
      cors: true,
      body: JSON.stringify({
        message: "You're authorized. Rejoice!",
      }),
    })
  );
};
