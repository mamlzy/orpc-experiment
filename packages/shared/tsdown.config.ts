import { defineConfig } from 'tsdown';

export default defineConfig({
  // tsconfig: './tsconfig.build.json',
  entry: ['src/index.ts', 'src/lib/utils.ts'],
  format: ['esm'],
  outDir: 'dist',
  dts: true,
  clean: true,
  sourcemap: false,
  //! excluding dependencies.
  // external: [],
});
