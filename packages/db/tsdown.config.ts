import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: [
    './src/index.ts',
    './src/model/index.ts',
    './src/schema/index.ts',
    './src/types/index.ts',
  ],
  external: ['postgres'],
});
