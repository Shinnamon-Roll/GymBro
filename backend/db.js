const { Sequelize } = require("sequelize");

const dbUrl =
  process.env.DATABASE_URL || "postgres://webadmin:OFQzlb19621@node86180-env-2210254.proen.app.ruk-com.cloud:11857/gymbro_db";

const sequelize = new Sequelize(dbUrl, {
  dialect: "postgres",
  logging: false,
});

module.exports = sequelize;
