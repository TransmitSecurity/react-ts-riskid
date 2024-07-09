// vite.config.ts
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import pluginRewriteAll from 'vite-plugin-rewrite-all';
import tsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';
import dts from 'vite-plugin-dts';

export default defineConfig(({ command }) => ({
  plugins: [
    dts({ insertTypesEntry: true }),
    react(),
    tsconfigPaths({
      projects: ['./tsconfig.json']
    }),
    svgr(),
    pluginRewriteAll(),
  ],
  build: {
    emptyOutDir: false,
    sourcemap: command === 'build' ? true : 'inline',
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          react: 'React',
        },
      },
    },
    lib: {
      entry: './index.ts',
      name: '@transmitsecurity/riskid-reactjs-ts',
      formats: ['es', 'cjs'],
      fileName: format => `index.${format}.js`,
    },
  }
}));
