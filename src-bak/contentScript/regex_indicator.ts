import { randomString } from './util';

const regex_indicator = {
  code_block_beginning: `[rf-rgi-cb[${randomString(5) + new Date().getTime()}]rf-rgi-cb]`,
} as const;

export { regex_indicator };
