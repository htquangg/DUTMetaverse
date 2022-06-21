import dotenv from 'dotenv';
import dotenvParseVariables from 'dotenv-parse-variables';

const env = dotenv.config({
  path: process.env.dotenv_path || undefined,
});

if (env.error) throw env.error;

export const ServiceConfig = dotenvParseVariables(
  env.parsed as dotenvParseVariables.Parsed,
) as NodeJS.ProcessEnv;
