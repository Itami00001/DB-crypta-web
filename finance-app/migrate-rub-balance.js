const { Sequelize } = require('sequelize');
require('dotenv').config();

// Создаем подключение к базе данных
const sequelize = new Sequelize(
  process.env.DB_NAME || 'finance_app_db',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || '123456',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5433,
    dialect: 'postgres',
    logging: console.log
  }
);

async function migrateRubBalance() {
  try {
    console.log('=== Миграция: добавление поля rub_balance ===\n');
    
    // Проверка подключения
    await sequelize.authenticate();
    console.log('✓ Подключение к базе данных успешно\n');
    
    // Проверка наличия поля rub_balance
    const [columns] = await sequelize.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'users'
      AND table_schema = 'public'
      AND column_name = 'rub_balance'
    `);
    
    if (columns.length > 0) {
      console.log('✓ Поле rub_balance уже существует');
      return;
    }
    
    // Добавление поля rub_balance
    await sequelize.query(`
      ALTER TABLE users
      ADD COLUMN rub_balance NUMERIC(20, 2) DEFAULT 0
    `);
    
    console.log('✓ Поле rub_balance успешно добавлено\n');
    
    // Проверка результата
    const [newColumns] = await sequelize.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
      AND table_schema = 'public'
      AND column_name = 'rub_balance'
    `);
    
    if (newColumns.length > 0) {
      console.log('Подтверждение структуры нового поля:');
      console.log(`  ${newColumns[0].column_name} | ${newColumns[0].data_type} | default: ${newColumns[0].column_default}`);
    }
    
  } catch (error) {
    console.error('Ошибка миграции:', error.message);
    console.error(error.stack);
  } finally {
    await sequelize.close();
  }
}

migrateRubBalance();
