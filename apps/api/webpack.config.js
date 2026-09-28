const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');
const { dependencies = {} } = require('./package.json');

// O `externalDependencies: 'all'` do Nx só enxerga o node_modules da raiz. Com pnpm,
// dependências declaradas só em apps/api (ex.: @prisma/client, que precisa do query
// engine nativo ao lado do client gerado) acabariam no bundle. Por isso as dependências
// de runtime do package.json do app são mantidas como externas.
const runtimeDeps = Object.entries(dependencies)
  .filter(([, version]) => !version.startsWith('workspace:'))
  .map(([name]) => name);

module.exports = {
  output: {
    path: join(__dirname, 'dist'),
    clean: true,
    ...(process.env.NODE_ENV !== 'production' && {
      devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    }),
  },
  externals: [
    ({ request }, callback) =>
      runtimeDeps.some((dep) => request === dep || request.startsWith(`${dep}/`))
        ? callback(null, `commonjs ${request}`)
        : callback(),
  ],
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets'],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: false,
      sourceMap: true,
      mergeExternals: true,
    }),
  ],
};
