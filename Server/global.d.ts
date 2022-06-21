namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string;
    IS_DEV: boolean;
    ENABLE_SSL: boolean;
    PORT: number;
    FB_SECRET_KEY: string;
    DATABASE_URL: string;
    SECRET_KEY: string;
  }
}
