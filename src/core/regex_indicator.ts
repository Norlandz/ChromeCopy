/**
 * Random markers used to protect specific blocks (like math or code)
 * from being mangled by Turndown's aggressive white-space normalization.
 */
export const regex_indicator = {
  get code_block_beginning() {
    return `[rf-rgi-cb[${Math.random().toString(36).substr(2, 5) + Date.now()}]rf-rgi-cb]`;
  }
} as const;
