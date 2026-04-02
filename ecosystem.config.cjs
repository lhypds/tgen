const fs = require("fs");
const path = require("path");

// Read PORT from .env
let port = 3190;
try {
  const env = fs.readFileSync(path.join(__dirname, ".env"), "utf8");
  const match = env.match(/^PORT=(\d+)/m);
  if (match) port = Number(match[1]);
} catch { }

module.exports = {
  apps: [
    {
      name: "tgen",
      script: "node_modules/.bin/serve",
      args: ["-s", "dist", "-l", String(port)],
      cwd: __dirname,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
