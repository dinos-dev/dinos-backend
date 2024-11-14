module.exports = {
  apps: [
    {
      name: 'dinos',
      script: './dist/main.js',
      instances: 0,
      watch: false,
      merge_logs: false,
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      // out_file: '/home/ubuntu/.pm2/logs/api-access.log', #
      // error_file: '/home/ubuntu/.pm2/logs/api-error.log', #
      autorestart: true,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
