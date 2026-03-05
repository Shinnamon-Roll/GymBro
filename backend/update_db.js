
const sequelize = require('./db');
const { DataTypes } = require('sequelize');

async function updateSchema() {
  try {
    const queryInterface = sequelize.getQueryInterface();
    const tableInfo = await queryInterface.describeTable('TrainingSessions');
    
    if (!tableInfo.endDate) {
      console.log('Adding endDate column...');
      await queryInterface.addColumn('TrainingSessions', 'endDate', {
        type: DataTypes.DATE,
        allowNull: true // Allow null initially for existing records
      });
      
      // Update existing records to have endDate = sessionDate + 1 hour
      // Using raw query for Postgres specific syntax
      await sequelize.query(`
        UPDATE "TrainingSessions" 
        SET "endDate" = "sessionDate" + interval '1 hour' 
        WHERE "endDate" IS NULL
      `);
      
      console.log('Column added and existing records updated.');
    } else {
      console.log('endDate column already exists.');
    }
  } catch (error) {
    console.error('Error updating schema:', error);
  } finally {
    await sequelize.close();
  }
}

updateSchema();
