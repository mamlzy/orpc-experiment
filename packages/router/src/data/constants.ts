import path from 'path';

export const CWD =
  process.env.NODE_ENV === 'production'
    ? path.join(process.cwd(), 'apps', 'api')
    : process.cwd();
