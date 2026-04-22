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
    
    // Проверка подключения
    await sequelize.authenticate();
    console.log('✓ Подключение к базе данных успешно\n');
    
    // Проверка существования таблицы users
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'users'
    `);
    
    if (tables.length === 0) {
      console.log('✗ Таблица users не существует!');
    } else {
      console.log('✓ Таблица users существует\n');
      
      // Получение структуры таблицы users
      const [columns] = await sequelize.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'users'
        AND table_schema = 'public'
        ORDER BY ordinal_position
      `);
      
      console.log('Структура таблицы users:');
      console.log('----------------------------------------');
      columns.forEach(col => {
        console.log(`${col.column_name.padEnd(20)} | ${col.data_type.padEnd(15)} | nullable: ${col.is_nullable} | default: ${col.column_default || 'NULL'}`);
      });
      console.log('----------------------------------------\n');
      
      // Проверка наличия необходимых полей
      const requiredFields = ['username', 'email', 'password_hash', 'coin_balance', 'btc_balance', 'usd_balance', 'rub_balance'];
      const existingFields = columns.map(col => col.column_name.toLowerCase());
      
      console.log('Проверка обязательных полей:');
      requiredFields.forEach(field => {
        const exists = existingFields.includes(field.toLowerCase());
        console.log(`${exists ? '✓' : '✗'} ${field}`);
      });
      console.log('\n');
      
      // Проверка данных в таблице
      const [users] = await sequelize.query('SELECT COUNT(*) as count FROM users');
      console.log(`Количество пользователей: ${users[0].count}\n`);
      
      if (users[0].count > 0) {
        const [userList] = await sequelize.query('SELECT id, username, email FROM users LIMIT 5');
        console.log('Первые 5 пользователей:');
        userList.forEach(user => {
          console.log(`  ID: ${user.id}, Username: ${user.username}, Email: ${user.email}`);
        });
        console.log('\n');
      }
    }
    
    // Проверка других важных таблиц
    const [allTables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('Все таблицы в базе данных:');
    allTables.forEach(t => console.log(`  - ${t.table_name}`));
    
  } catch (error) {
    console.error('Ошибка диагностики:', error.message);
    console.error(error.stack);
  } finally {
    await sequelize.close();
  }
}

diagnoseDatabase();
