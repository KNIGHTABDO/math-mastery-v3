const config = {
  plugins: {
    "@tailwindcss/postcss": {},
    "postcss-import": {},
    "postcss-preset-env": {
      stage: 1,
      features: {
        "nesting-rules": true,
      },
    },
  },
};

export default config;
