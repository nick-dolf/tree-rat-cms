const crypto = require("crypto");
const keyLength = 32;

/**
 * Has a password or a secret with a password hashing algorithm (scrypt)
 * @param {string} password
 * @returns {string} The salt+hash
 */
async function hash(password) {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString("hex");

    crypto.scrypt(password, salt, keyLength, (err, derivedKey) => {
      if (err) reject(err);
      resolve(`${salt}.${derivedKey.toString("hex")}`);
    });
  });
}

/**
 * Compare a plain text password with a salt+hash password
 * @param {string} password The plain text password
 * @param {string} hash The hash+salt to check against
 * @returns {boolean}
 */
async function compare(password, hash) {
  return new Promise((resolve, reject) => {
    const [salt, hashKey] = hash.split(".");
    const hashKeyBuff = Buffer.from(hashKey, "hex");
    crypto.scrypt(password, salt, keyLength, (err, derivedKey) => {
      if (err) reject(err);
      resolve(crypto.timingSafeEqual(hashKeyBuff, derivedKey));
    });
  });
}

module.exports = { hash, compare };
