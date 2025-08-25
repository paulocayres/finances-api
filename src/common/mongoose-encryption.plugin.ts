import { Model } from 'mongoose';
import { EncryptionService } from './encryption.service';

function isObject(v: any) {
  return v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date);
}

function traverseAndEncrypt(obj: any, encSvc: EncryptionService) {
  if (!obj || typeof obj !== 'object') return;
  for (const k of Object.keys(obj)) {
    if (k === '_id' || k === 'ownerId' || (k !== 'valor' && k !== 'descricao')) continue; // Ignore _id, ownerId, and encrypt only 'valor' and 'descricao'
    const v = obj[k];
    if (v === null || v === undefined) continue;
    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
      obj[k] = encSvc.encrypt(String(v));
    }
  }
}

function traverseAndDecrypt(obj: any, encSvc: EncryptionService) {
  if (!obj || typeof obj !== 'object') return;
  for (const k of Object.keys(obj)) {
    if (k === '_id' || k === 'ownerId' || (k !== 'valor' && k !== 'descricao')) continue; // Ignore _id, ownerId, and decrypt only 'valor' and 'descricao'
    const v = obj[k];
    if (v === null || v === undefined) continue;
    if (typeof v === 'string' && encSvc.looksEncrypted(v)) {
      try {
        const dec = encSvc.decrypt(v);
        if (/^-?\d+(\.\d+)?$/.test(dec)) obj[k] = Number(dec);
        else if (dec === 'true' || dec === 'false') obj[k] = dec === 'true';
        else obj[k] = dec;
      } catch (e) {
        // not decryptable or not actually encrypted; leave as is
      }
    }
  }
}

export function createEncryptionPlugin(encSvc: EncryptionService) {
  return function encryptionPlugin(schema: any) {
    // pre validate decrypt if payload is already encrypted (so validation runs on plaintext)
    schema.pre('validate', function(next: any) {
      try {
        const doc: any = this;
        traverseAndDecrypt(doc, encSvc);
      } catch (e) {
        // ignore decryption failure; proceed with whatever is there
      }
      next();
    });

    // pre save encrypt
    schema.pre('save', function(next: any) {
      try {
        const doc: any = this;

        // Ensure _id is not manually set to an invalid value
        if (doc._id && doc._id.toString() === '000000000000000000000000') {
          return next(new Error('Invalid _id detected: 000000000000000000000000'));
        }

        // Walk and encrypt only plaintext values (leave ones that already look encrypted)
        function encryptInPlace(obj: any) {
          if (!obj || typeof obj !== 'object') return;
          for (const k of Object.keys(obj)) {
            if (k !== 'valor' && k !== 'descricao') continue; // Só criptografa valor e descricao
            const v = obj[k];
            if (v === null || v === undefined) continue;
            if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
              if (typeof v === 'string' && encSvc.looksEncrypted(v)) continue;
              obj[k] = encSvc.encrypt(String(v));
            }
          }
        }
        encryptInPlace(doc);
      } catch (e) {
        // ignore encryption failure to not block save
      }
      next();
    });

    // ensure when creating/updating via insertMany or create -> hook to encrypt
    schema.pre('insertMany', function(next: any, docs: any[]) {
      try {
        for (const d of docs) traverseAndEncrypt(d, encSvc);
      } catch {}
      next();
    });

    // post init (after model is hydrated) decrypt fields for application use
    schema.post('init', function(doc: any) {
      try {
        traverseAndDecrypt(doc, encSvc);
      } catch {}
    });

    // Use schema.set transforms to decrypt on output without overriding Mongoose internals
    schema.set('toObject', {
      transform: (_doc: any, ret: any) => {
        try {
          traverseAndDecrypt(ret, encSvc);
        } catch {}
        return ret;
      }
    });
    schema.set('toJSON', {
      transform: (_doc: any, ret: any) => {
        try {
          traverseAndDecrypt(ret, encSvc);
        } catch {}
        return ret;
      }
    });
  };
}
