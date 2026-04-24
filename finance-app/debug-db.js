const db = require("./app/models");
const User = db.users;

async function check() {
    try {
        const admins = await User.findAll({ where: { isAdmin: true } });
        console.log("--- Admins ---");
        admins.forEach(u => console.log(`ID: ${u.id}, Username: ${u.username}, Email: ${u.email}, isAdmin: ${u.isAdmin}`));

        console.log("\n--- NewsPost Table Columns ---");
        const [results] = await db.sequelize.query("SELECT column_name, data_type, character_maximum_length FROM information_schema.columns WHERE table_name = 'news_posts'");
        results.forEach(c => console.log(`${c.column_name}: ${c.data_type} (${c.character_maximum_length || 'N/A'})`));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
