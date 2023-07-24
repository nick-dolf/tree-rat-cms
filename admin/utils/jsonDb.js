const path = require("path");
const fs = require("fs");

class JsonDb {
  /**
   * @param {String} fname - File name to store - will append .json if needed
   * @param {String} [id = "id"] - Unique key to identify object
   * @param {String} [folder = "json_db_storage"] - Storage folder
   */
  constructor(fname, id = "id", folder = "json_db_storage") {
    this.fname = fname;
    if (path.extname(fname) !== ".json") {
      fname = fname + ".json";
    }

    this.filePath = path.join(process.cwd(), folder, fname);
    this.id = id;

    // Ensure storage directory Exists
    fs.mkdirSync(path.join(process.cwd(), folder), { recursive: true });

    try {
      this.data = JSON.parse(fs.readFileSync(this.filePath));
    } catch {
      this.data = [];
      fs.writeFileSync(this.filePath, JSON.stringify(this.data));
    }
  }

  // get data() {
  //   return this._data;
  // }

  /**
   *
   * @param {Object} object - add an object, must have matching id parameter
   * @returns {Boolean} True if object added, false if object has duplicate id
   */
  add(object) {
    if (!(this.id in object)) {
      throw new Error("Object missing valid id");
    }

    const result = this.data.some((e) => {
      return e[this.id] === object[this.id];
    });

    if (result) {
      return false;
    }

    this.data.unshift(object);

    const pretty = JSON.stringify(this.data, null, 2);
    fs.writeFileSync(this.filePath, pretty);

    return true;
  }

  /**
   *
   * @param {Object} object - delete an object, must have matching id parameter
   * @returns {Boolean} True if object deleted, false if object not in db
   */
  delete(object) {
    if (!(this.id in object)) {
      throw new Error("Object missing valid id");
    }

    const index = this.data.findIndex((e) => {
      return e[this.id] === object[this.id];
    });

    if (index == -1) {
      return false;
    }

    this.data.splice(index, 1);

    const pretty = JSON.stringify(this.data, null, 2);
    fs.writeFileSync(this.filePath, pretty);

    return true;
  }

  /**
   *
   * @param {String} id - unique string
   * @returns {Boolean} True if object deleted, false if object not in db
   */
  deleteById(id) {
    const index = this.data.findIndex((e) => {
      return e[this.id] === id;
    });

    if (index == -1) {
      return false;
    }

    this.data.splice(index, 1);

    const pretty = JSON.stringify(this.data, null, 2);
    fs.writeFileSync(this.filePath, pretty);

    return true;
  }

  /**
   *
   * @param {Object} object - update an object, must have matching id parameter
   * @returns {Boolean} True if object updated, false if object not in db
   */
  update(object) {
    if (!(this.id in object)) {
      throw new Error("Object missing valid id");
    }

    const index = this.data.findIndex((e) => {
      return e[this.id] === object[this.id];
    });

    if (index == -1) {
      return false;
    }

    this.data[index] = object;

    const pretty = JSON.stringify(this.data, null, 2);
    fs.writeFileSync(this.filePath, pretty);

    return true;
  }

  /**
   *
   * @param {String} id - unique string
   * @returns {Object} Object if found, false if object not in db
   */
  findById(id) {
    const index = this.data.findIndex((e) => {
      return e[this.id] === id;
    });

    if (index == -1) {
      return false;
    }

    return this.data[index];
  }
}

module.exports = JsonDb;
