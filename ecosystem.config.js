module.exports = {
  apps: [
    {
      name: 'vaxav-api',
      cwd: './api',
      script: 'php',
      args: 'artisan serve --host=0.0.0.0 --port=8000',
      watch: false,
      env: {
        NODE_ENV: 'development',
      },
    },
    {
      name: 'vaxav-frontend',
      cwd: './frontend',
      script: 'npm',
      args: 'run dev',
      watch: false,
      env: {
        NODE_ENV: 'development',
      },
    },
  ],
};
