export const ServiceConfig = {
  port: Number(process.env.PORT) || 3000,
  isDev: JSON.parse(process.env.IS_DEV!.toLowerCase()) || true,
  enableSSL: JSON.parse(process.env.ENABLE_SSL!.toLowerCase()) || false,
  fbSecretKey: String(process.env.FB_SECRET_KEY) || '',
};
