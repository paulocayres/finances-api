import { Model } from 'mongoose';
import { EncryptionService } from './encryption.service';

function isObject(v: any) {
  return v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date);
}

function traverseAndEncrypt(obj: any, encSvc: EncryptionService) {
  if (!obj || typeof obj !== 'object') return;
  for (const k of Object.keys(obj)) {
    if (k === 'uid') continue; // do not encrypt uid anywhere
    const v = obj[k];
    if (v === null || v === undefined) continue;
    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
      // primitive -> encrypt to string
      obj[k] = encSvc.encrypt(String(v));
    } else if (Array.isArray(v)) {
      obj[k] = v.map((el) => {
        if (isObject(el)) {
          traverseAndEncrypt(el, encSvc);
          return el;
        } else {
          return encSvc.encrypt(String(el));
        }
      });
    } else if (isObject(v)) {
      traverseAndEncrypt(v, encSvc);
    } else if (v instanceof Date) {
      obj[k] = encSvc.encrypt(v.toISOString());
    } else {
      // fallback
      obj[k] = encSvc.encrypt(String(v));
    }
  }
}

function traverseAndDecrypt(obj: any, encSvc: EncryptionService) {
  if (!obj || typeof obj !== 'object') return;
  for (const k of Object.keys(obj)) {
    if (k === 'uid') continue;
    const v = obj[k];
    if (v === null || v === undefined) continue;
    if (typeof v === 'string' && encSvc.looksEncrypted(v)) {
      try {
        const dec = encSvc.decrypt(v);
        // try parse JSON or ISO date
        if (/^\d{4}-\d{2}-\d{2}T/.test(dec)) {
          obj[k] = new Date(dec);
        } else {
          // keep original type guess: number/boolean/string
          if (/^-?\d+(\.\d+)?$/.test(dec)) obj[k] = Number(dec);
          else if (dec === 'true' || dec === 'false') obj[k] = dec === 'true';
          else obj[k] = dec;
        }
      } catch (e) {
        // not decryptable or not actually encrypted; leave as is
      }
    } else if (Array.isArray(v)) {
      obj[k] = v.map((el) => {
        if (typeof el === 'string' && encSvc.looksEncrypted(el)) {
          try {
            return encSvc.decrypt(el);
          } catch {
            return el;
          }
        } else if (isObject(el)) {
          traverseAndDecrypt(el, encSvc);
          return el;
        } else {
          return el;
        }
      });
    } else if (isObject(v)) {
      traverseAndDecrypt(v, encSvc);
    }
  }
}

export function createEncryptionPlugin(encSvc: EncryptionService) {
  return function encryptionPlugin(schema: any) {
    // pre save encrypt
    schema.pre('save', function(next: any) {
      try {
        const doc = this.toObject ? this.toObject() : this;
        traverseAndEncrypt(doc, encSvc);
        // copy back encrypted values to this
        Object.assign(this, doc);
      } catch (e) {
        // ignore encryption failure to not block save; log if needed
        // console.error('Encryption pre-save failed', e);
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

    // on toObject / toJSON, decrypt a cloned object to avoid leaking encrypted fields
    const toObject = schema.methods.toObject;
    schema.methods.toObject = function(...args: any[]) {
      const obj = toObject ? toObject.apply(this, args) : Object.assign({}, this);
      try {
        traverseAndDecrypt(obj, encSvc);
      } catch {}
      return obj;
    };

    const toJSON = schema.methods.toJSON;
    schema.methods.toJSON = function(...args: any[]) {
      const obj = toJSON ? toJSON.apply(this, args) : Object.assign({}, this);
      try {
        traverseAndDecrypt(obj, encSvc);
      } catch {}
      return obj;
    };
  };
}
