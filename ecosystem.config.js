module.exports = {
  apps: [
    {
      name: 'vaxav-backend',
      cwd: './backend',
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
    {
      name: 'vaxav-storybook',
      cwd: './frontend',
      script: 'npm',
      args: 'run storybook -- --port 6006 --host 0.0.0.0',
      watch: false,
      env: {
        NODE_ENV: 'development',
      },
    },
  ],
};
