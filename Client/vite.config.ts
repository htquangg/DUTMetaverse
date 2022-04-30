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
          '@tlq': resolve(__dirname, './src'),
        },
      },
      build: {
        outDir: resolve(__dirname, 'dist'),
        emptyOutDir: true,
        rollupOptions: {},
      },
      server: {
        port: process.env.PORT === undefined ? 8000 : +process.env.PORT,
        watch: {
          usePolling: true,
        },
      },
      optimizeDeps: {
        exclude: ['path'],
      },
      define: {
        'process.env': {
          GAME_SERVER_DOMAIN: 'localhost',
          GAME_SERVER_PORT: '3000',
          PEER_SERVER_DOMAIN: 'localhost',
          PEER_SERVER_PORT: '9000',
          PEER_SERVER_PATH: 'myapp',
        },
      },
    };
  }
  // PROD
  return {
    root: srcRoot,
    base: './',
    plugins: [react()],
    resolve: {
      alias: {
        '@tlq': resolve(__dirname, './src'),
      },
    },
    build: {
      outDir: resolve(__dirname, 'dist'),
      emptyOutDir: true,
      rollupOptions: {},
    },
    server: {
      port: process.env.PORT === undefined ? 8000 : +process.env.PORTS,
      watch: {
        usePolling: true,
      },
    },
    optimizeDeps: {
      exclude: ['path'],
    },
  };
};
