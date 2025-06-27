const { MongoClient } = require('mongodb');

const oldUri = "mongodb+srv://ginoreyes2:LT1PqWGmSySXSh8B@cluster0.ckni0ry.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const newUri = "mongodb+srv://davidfajardo26v:9SH1rgTBbhpLi0XR@cluster0.buawolj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Fixed target DB name
const targetDbName = "zentryx";

async function migrate() {
  const oldClient = new MongoClient(oldUri);
  const newClient = new MongoClient(newUri);

  try {
    await oldClient.connect();
    await newClient.connect();

    // Step 1: Detect old DB name
    const adminDb = oldClient.db().admin();
    const dbs = await adminDb.listDatabases();

    const sourceDbInfo = dbs.databases.find((db: { name: string }) =>
    !['admin', 'local', 'config'].includes(db.name)
    );

    if (!sourceDbInfo) {
      console.error("❌ No valid source database found.");
      return;
    }

    const sourceDbName = sourceDbInfo.name;
    const oldDb = oldClient.db(sourceDbName);
    const newDb = newClient.db(targetDbName);

    console.log(`🔍 Detected source DB: '${sourceDbName}'`);
    console.log(`📦 Target DB: '${targetDbName}'`);

    const collections = await oldDb.listCollections().toArray();

    for (const { name } of collections) {
      const oldCollection = oldDb.collection(name);
      const newCollection = newDb.collection(name);

      const documents = await oldCollection.find({}).toArray();

      if (documents.length > 0) {
        console.log(`➡️  Migrating ${documents.length} documents from '${name}'...`);
        await newCollection.insertMany(documents);
      } else {
        console.log(`⚠️  Skipping empty collection: ${name}`);
      }
    }

    console.log("✅ Migration to 'zentryx' completed.");
  } catch (err) {
    console.error("❌ Migration error:", err);
  } finally {
    await oldClient.close();
    await newClient.close();
  }
}

migrate();
