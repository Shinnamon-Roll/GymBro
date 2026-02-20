const { Sequelize, DataTypes } = require("sequelize");

const dbUrl =
  process.env.DATABASE_URL || "postgres://user:password@localhost:5432/gymbro_db";

const sequelize = new Sequelize(dbUrl, {
  dialect: "postgres",
  logging: false,
});

const Customers = sequelize.define(
  "Customers",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    fullName: { type: DataTypes.STRING(150), allowNull: false },
    email: { type: DataTypes.STRING(150), allowNull: false },
    phone: { type: DataTypes.STRING(20) },
    memberType: { type: DataTypes.STRING(50), allowNull: false },
    memberLevel: { type: DataTypes.STRING(50), allowNull: false },
    memberStartDate: { type: DataTypes.DATE, allowNull: false },
    memberEndDate: { type: DataTypes.DATE },
  },
  { tableName: "Customers", timestamps: false, freezeTableName: true }
);

const Trainers = sequelize.define(
  "Trainers",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    trainerName: { type: DataTypes.STRING(150), allowNull: false },
    trainerLevel: { type: DataTypes.STRING(50), allowNull: false },
    specialty: { type: DataTypes.STRING(100) },
    phone: { type: DataTypes.STRING(20) },
  },
  { tableName: "Trainers", timestamps: false, freezeTableName: true }
);

const GymEquipments = sequelize.define(
  "GymEquipments",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    equipmentName: { type: DataTypes.STRING(150), allowNull: false },
    category: { type: DataTypes.STRING(100) },
    status: { type: DataTypes.STRING(50), allowNull: false },
  },
  { tableName: "GymEquipments", timestamps: false, freezeTableName: true }
);

const TrainingSessions = sequelize.define(
  "TrainingSessions",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    sessionDate: { type: DataTypes.DATE, allowNull: false },
    customerId: { type: DataTypes.INTEGER, allowNull: false },
    trainerId: { type: DataTypes.INTEGER, allowNull: false },
    equipmentId: { type: DataTypes.INTEGER, allowNull: false },
  },
  { tableName: "TrainingSessions", timestamps: false, freezeTableName: true }
);

TrainingSessions.belongsTo(Customers, { as: "customer", foreignKey: "customerId" });
TrainingSessions.belongsTo(Trainers, { as: "trainer", foreignKey: "trainerId" });
TrainingSessions.belongsTo(GymEquipments, { as: "equipment", foreignKey: "equipmentId" });
Customers.hasMany(TrainingSessions, { as: "sessions", foreignKey: "customerId" });
Trainers.hasMany(TrainingSessions, { as: "sessions", foreignKey: "trainerId" });
GymEquipments.hasMany(TrainingSessions, { as: "sessions", foreignKey: "equipmentId" });

sequelize.sync();

module.exports = sequelize;
module.exports.Customers = Customers;
module.exports.Trainers = Trainers;
module.exports.GymEquipments = GymEquipments;
module.exports.TrainingSessions = TrainingSessions;
