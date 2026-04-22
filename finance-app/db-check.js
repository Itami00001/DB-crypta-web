const db = require("./app/models");

async function checkDb() {
    try {
        await db.sequelize.authenticate();
        console.log("Database connection OK.");

        // Check table list
        const [tables] = await db.sequelize.query(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
        );
        console.log("Tables in DB:", tables.map(t => t.table_name).join(", "));

        // Check columns of 'users' table
        if (tables.some(t => t.table_name === 'users')) {
            const [columns] = await db.sequelize.query(
                "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users'"
            );
            console.log("Columns in 'users' table:");
            columns.forEach(c => console.log(`- ${c.column_name} (${c.data_type})`));
        } else {
            console.log("CRITICAL: 'users' table not found!");
        }

        process.exit(0);
    } catch (err) {
        console.error("Diagnostic failed:", err);
        process.exit(1);
    }
}

checkDb();
