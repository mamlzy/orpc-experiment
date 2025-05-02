import { defineConfig } from 'tsup';

const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/model/index.ts',
    'src/schema/index.ts',
    'src/types/index.ts',
  ],
  format: ['esm'],
  dts: true,
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  minify: isProduction,
});
