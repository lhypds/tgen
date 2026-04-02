module.exports = {
  apps: [
    {
      name: "tgen",
      script: "node_modules/.bin/vite",
      args: "preview",
      cwd: __dirname,
      env_file: ".env",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
