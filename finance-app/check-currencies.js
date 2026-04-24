const db = require("./app/models");
const Crypto = db.cryptoCurrencies;

async function check() {
    try {
        const list = await Crypto.findAll();
        console.log("Current Currencies in DB:");
        list.forEach(c => {
            console.log(`- ${c.symbol}: ${c.name}`);
        });

        console.log("\n--- Transaction Table Constraints ---");
        const [constraints] = await db.sequelize.query(`
      SELECT conname, pg_get_constraintdef(oid) 
      FROM pg_constraint 
      WHERE conrelid = 'transactions'::regclass
    `);
        constraints.forEach(c => console.log(`${c.conname}: ${c.pg_get_constraintdef}`));

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

check();
