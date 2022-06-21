import winston from 'winston';
import util from 'util';
var logStdout = process.stdout;
const logger = winston.createLogger({
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.txt', level: 'error' }),
    new winston.transports.File({ filename: 'log.txt' }),
  ],
});
const getDate = function () {
  var today = new Date();
  return (
    '[' +
    today.getFullYear() +
    '-' +
    (today.getMonth() + 1) +
    '-' +
    today.getDate() +
    ' ' +
    today.getHours() +
    ':' +
    today.getMinutes() +
    ':' +
    today.getSeconds() +
    ']'
  );
};
console.log = function () {
  let msg = '[log]' + getDate() + util.format.apply(null, [...arguments]);
  logger.info(msg);
  logStdout.write(msg + '\n');
};
console.error = function () {
  let msg = '[error]' + getDate() + util.format.apply(null, [...arguments]);
  logger.error(msg);
  logStdout.write(msg + '\n');
};
console.warn = function () {
  let msg = '[warn]' + getDate() + util.format.apply(null, [...arguments]);
  logger.warn(msg);
  logStdout.write(msg + '\n');
};
process.on('unhandledRejection', (error: any, promise: any) => {
  console.error(error, promise);
  console.log(error, promise);
});
process.on('uncaughtException', (error) => {
  console.error(error);
  console.log(error);
});
