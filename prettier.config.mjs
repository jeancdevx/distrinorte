import config from './packages/config/prettier.json' with { type: 'json' }

/** @type {import('prettier').Config} */
export default {
  ...config,
  plugins: ['@ianvs/prettier-plugin-sort-imports']
}
