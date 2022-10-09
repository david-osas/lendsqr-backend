import * as dotenv from 'dotenv';
dotenv.config();
import type { Knex } from 'knex';

// Update with your config settings.

const config: Knex.Config = {
  client: process.env.DB_CLIENT,
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
};

module.exports = config;
