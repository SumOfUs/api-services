// @flow
export function basicAuthToken(user: string, password: string): string {
  return `Basic ${new Buffer(`${user}:${password}`).toString('base64')}`;
}
