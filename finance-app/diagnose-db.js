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

async function diagnoseDatabase() {
  try {
    console.log('=== Диагностика базы данных ===\n');
    await sequelize.authenticate();
    console.log('✓ Подключение к базе данных успешно\n');

    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log('Все таблицы:');
    tables.forEach(t => console.log(`  - ${t.table_name}`));
    console.log('\n');

    console.log('--- Инспекция таблицы transactions ---');
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'transactions'
      AND table_schema = 'public'
    `);
    columns.forEach(col => console.log(`${col.column_name}: ${col.data_type}`));

    console.log('\n--- Ограничения таблицы transactions ---');
    const [constraints] = await sequelize.query(`
      SELECT conname, pg_get_constraintdef(oid) 
      FROM pg_constraint 
      WHERE conrelid = 'transactions'::regclass
    `);
    constraints.forEach(c => console.log(`${c.conname}: ${c.pg_get_constraintdef}`));

    console.log('\n--- Содержимое crypto_currencies ---');
    const [cryptos] = await sequelize.query(`SELECT symbol, name FROM crypto_currencies`);
    cryptos.forEach(c => console.log(`  - ${c.symbol}: ${c.name}`));

  } catch (error) {
    console.error('Ошибка диагностики:', error.message);
  } finally {
    await sequelize.close();
  }
}

diagnoseDatabase();
