/**
 * Script to encrypt existing documents in MongoDB.
 * Usage: ENCRYPTION_KEY=... node dist/scripts/migrate/encrypt-existing.js
 *
 * This script is idempotent: it checks if a field looks encrypted and skips it.
 */
const { MongoClient } = require('mongodb');
//const { createEncryptionPlugin } = require('../../src/common/mongoose-encryption.plugin');
//const { createEncryptionPlugin } = require('../../src/common/mongoose-encryption.plugin');
const path = require('path');

async function main() {
  //const uri = process.env.MONGO_URI;
  const uri = 'mongodb+srv://paulo_cayres:'+ process.env.MONGO_URI + '@cayres.q7alqy4.mongodb.net/?retryWrites=true&w=majority&appName=Cayres';
  if (!uri) {
    console.error('MONGO_URI env required');
    process.exit(1);
  }
  const key = process.env.ENCRYPTION_KEY;
  //const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    console.error('ENCRYPTION_KEY env required');
    process.exit(1);
  }
  const client = new MongoClient(uri);
  await client.connect();
  console.log('Connected to Mongo');
  const db = client.db();

  // Collections to encrypt: all collections except system collections
  const collections = await db.listCollections().toArray();
  for (const c of collections) {
    const name = c.name;
    if (name.startsWith('system.')) continue;
    console.log('Processing collection', name);
    const col = db.collection(name);
    const cursor = col.find({});
    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      // skip if already encrypted (heuristic: check non-uid fields for base64-looking strings)
      let changed = false;
      const newDoc = Object.assign({}, doc);
      for (const k of Object.keys(newDoc)) {
        if (k === 'uid' || k === '_id') continue;
        const v = newDoc[k];
        if (typeof v === 'string' && /^[A-Za-z0-9+/=]+$/.test(v) && v.length >= 32) {
          // looks encrypted -> skip
          continue;
        } else if (typeof v === 'object') {
          // skip complex check for now, encrypt top-level primitives
        } else {
          // primitive -> encrypt using simple local AES via Node crypto
          const crypto = require('crypto');
          const ALGO = 'aes-256-gcm';
          const IV_LENGTH = 12;
          const TAG_LENGTH = 16;
          const keyBuf = Buffer.from(key, 'base64');
          const iv = crypto.randomBytes(IV_LENGTH);
          const cipher = crypto.createCipheriv(ALGO, keyBuf, iv, { authTagLength: TAG_LENGTH });
          const enc = Buffer.concat([cipher.update(String(v),'utf8'), cipher.final()]);
          const tag = cipher.getAuthTag();
          newDoc[k] = Buffer.concat([iv, tag, enc]).toString('base64');
          changed = true;
        }
      }
      if (changed) {
        await col.replaceOne({ _id: doc._id }, newDoc);
        console.log('Encrypted doc', doc._id, 'in', name);
      }
    }
  }

  await client.close();
  console.log('Done.');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
