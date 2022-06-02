// import path from 'path';
//
// const __dirname = path.resolve();
//
// export default {
//   webpack: {
//     alias: {
//       '@tlq': path.resolve(__dirname, 'src'),
//     },
//   },
// };
const path = require('path');
module.exports = {
  webpack: {
    alias: {
      '@tlq': path.resolve(__dirname, 'src'),
    },
    configure: (webpackConfig, { env, paths }) => {
      paths.appBuild = webpackConfig.output.path = path.resolve('dist');
      return webpackConfig; // Important: return the modified config
    },
  },
};
