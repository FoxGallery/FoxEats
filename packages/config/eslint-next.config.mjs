import base from './eslint.config.mjs';
import nextPlugin from 'eslint-config-next';

export default [
  ...base,
  {
    rules: {
      ...nextPlugin.rules,
    },
  },
];
