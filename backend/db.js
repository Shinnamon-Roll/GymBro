const { Sequelize } = require("sequelize");

const dbUrl =
  process.env.DATABASE_URL || "postgres://user:password@localhost:5432/gymbro_db";

const sequelize = new Sequelize(dbUrl, {
  dialect: "postgres",
  logging: false,
});

module.exports = sequelize;
