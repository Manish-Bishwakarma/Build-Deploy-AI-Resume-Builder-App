module.exports = ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      connectionString: env('DATABASE_URL'),
      host: env('DATABASE_HOST', 'aws-1-ap-southeast-1.pooler.supabase.com'),
      port: env.int('DATABASE_PORT', 5432),
      database: env('DATABASE_NAME', 'postgres'),
      user: env('DATABASE_USERNAME', 'postgres.ksxabyeowlludflcjhvv'),
      password: env('DATABASE_PASSWORD', ''),
      ssl: {
        rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', false),
      },
    },
    pool: {
      min: env.int('DATABASE_POOL_MIN', 2),
      max: env.int('DATABASE_POOL_MAX', 10),
      acquireTimeoutMillis: env.int('DATABASE_ACQUIRE_TIMEOUT', 60000),
      createTimeoutMillis: env.int('DATABASE_CREATE_TIMEOUT', 30000),
      destroyTimeoutMillis: env.int('DATABASE_DESTROY_TIMEOUT', 5000),
      idleTimeoutMillis: env.int('DATABASE_IDLE_TIMEOUT', 30000),
      reapIntervalMillis: env.int('DATABASE_REAP_INTERVAL', 1000),
      createRetryIntervalMillis: env.int('DATABASE_CREATE_RETRY_INTERVAL', 200),
    },
    debug: false,
  },
});