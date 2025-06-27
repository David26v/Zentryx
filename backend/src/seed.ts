require('dotenv').config({ path: './.env.migration' });
const { MongoClient } = require('mongodb');

const sourceUri = process.env.SOURCE_URI;
const targetUri = process.env.TARGET_URI;

async function migrate() {
  const sourceClient = new MongoClient(sourceUri);
  const targetClient = new MongoClient(targetUri);

  try {
    await sourceClient.connect();
    await targetClient.connect();

    const sourceDb = sourceClient.db(); // cluster0 default
    const targetDb = targetClient.db(); // zentryx target

    const collections = await sourceDb.listCollections().toArray();

    for (const { name } of collections) {
      console.log(`Migrating collection: ${name}`);

      const sourceColl = sourceDb.collection(name);
      const targetColl = targetDb.collection(name);

      const docs = await sourceColl.find({}).toArray();
      if (docs.length > 0) {
        await targetColl.insertMany(docs);
        console.log(`✅ Migrated ${docs.length} documents to ${name}`);
      } else {
        console.log(`⚠️ No documents in ${name}`);
      }
    }

    console.log("✅ Migration completed successfully.");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await sourceClient.close();
    await targetClient.close();
  }
}

migrate();
