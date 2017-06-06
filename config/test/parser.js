const paths = require('../paths');

const tsconfig = require(paths.tsconfig);

require('ts-node').register({
  compilerOptions: Object.assign({}, tsconfig.compilerOptions, {
    declaration: false,
    module: 'commonjs',
    target: 'es2015',
  }),
});
