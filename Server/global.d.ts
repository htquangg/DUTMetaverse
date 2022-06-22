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

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }
