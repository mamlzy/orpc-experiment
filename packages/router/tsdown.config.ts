import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['./src'],
  external: [/^@repo\/.*/, 'fs', 'path'],
});
