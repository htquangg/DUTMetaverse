import react from '@vitejs/plugin-react';
import { UserConfig, ConfigEnv } from 'vite';
import { resolve, join } from 'path';

const srcRoot = join(__dirname, 'src');

export default ({ command }: ConfigEnv): UserConfig => {
  // DEV
  if (command === 'serve') {
    return {
      root: srcRoot,
      base: '/',
      plugins: [react()],
      resolve: {
        alias: {
          '/@': srcRoot
        }
      },
      build: {
        outDir: resolve(__dirname, 'dist'),
        emptyOutDir: true,
        rollupOptions: {}
      },
      server: {
        port: process.env.PORT === undefined ? 8000 : +process.env.PORT
      },
      optimizeDeps: {
        exclude: ['path']
      }
    };
  }
  // PROD
  return {
    root: srcRoot,
    base: './',
    plugins: [react()],
    resolve: {
      alias: {
        '/@': srcRoot
      }
    },
    build: {
      outDir: resolve(__dirname, 'dist'),
      emptyOutDir: true,
      rollupOptions: {}
    },
    server: {
      port: process.env.PORT === undefined ? 8000 : +process.env.PORT
    },
    optimizeDeps: {
      exclude: ['path']
    }
  };
};
