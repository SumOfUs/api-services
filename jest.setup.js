import path from 'path';
import replayer from 'replayer';
import dotenv from 'dotenv';

Object.keys(dotenv.config().parsed).forEach(key => {
  replayer.substitute(`<${key}>`, () => process.env[key]);
});

replayer.fixtureDir(path.join(process.cwd(), 'replayer-fixtures'));

replayer.configure({});
jest.setTimeout(10000);
