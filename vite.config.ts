import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    dts({
      tsconfigPath: resolve(rootDir, 'tsconfig.build.json'),
      rollupTypes: false,
      include: ['src'],
    }),
  ],
  css: {
    modules: {
      // Readable in devtools, stable across builds, still collision-free.
      generateScopedName: 'ins-[local]-[hash:base64:5]',
    },
  },
  build: {
    lib: {
      entry: resolve(rootDir, 'src/index.ts'),
      formats: ['es'],
      fileName: () => 'index.js',
      cssFileName: 'style',
    },
    sourcemap: true,
    rollupOptions: {
      // React is a peer dependency: the consuming app supplies it.
      external: ['react', 'react-dom', 'react/jsx-runtime'],
    },
  },
});
