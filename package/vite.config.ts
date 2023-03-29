import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import pluginRewriteAll from 'vite-plugin-rewrite-all';
import svgr from 'vite-plugin-svgr';
import dts from 'vite-plugin-dts';

export default defineConfig(({ command }) => ({
  plugins: [
    dts(),
    react(),

    /** Allows us importing svg's */
    svgr(),

    /** Created an override on the server to redirect all requests to the dev server to index.html (so react-router can handle it) */
    pluginRewriteAll(),
  ],
  build: {
    emptyOutDir: false,
    sourcemap: command === 'build' ? true : 'inline', // build for prod(command "build") we want source map in seperated files. during dev we ok with inline source map
    rollupOptions: {
      external: ['React', 'react', 'react-dom'],
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
      formats: ['es'],
      fileName: format => {
        return `index.${format}.js`;
      }
    },
  }
}),
);
