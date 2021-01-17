const rootDir = process.env.ORM_ROOT_DIR;

module.exports = {
  type: "postgres",
  url: process.env.DATABASE_URL,
  synchronize: process.env.SERVER_MODE == "development" ? true : false,
  logging: process.env.SERVER_MODE == "development" ? true : false,
  entities: [rootDir + "/domain/entities/**/*.{js,ts}"],
  migrations: [rootDir + "/domain/migrations/*.{js,ts}"],
  seeds: [rootDir + "/domain/seeds/**/*.{js,ts}"],
  cli: {
    entitiesDir: "src/domain/entity",
    migrationsDir: "src/domain/migration",
  },
};