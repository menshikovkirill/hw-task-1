const path = require('path');
const fs = require("fs");
const { imageFolder } = require('../config');
const { writeFile, removeFile, exists } = require('../utils/fs');
const { generateId } = require('../utils/generateId');

module.exports = class Image {
  constructor(id, size, uploadedAt) {
    this.id = id || generateId();
    this.uploadedAt = uploadedAt || Date.now();
    this.size = size; 

    this.originalFilename = `${this.id}.jpg`;
  }

  async removeOriginal() {
    await removeFile(path.resolve(imageFolder, this.originalFilename));
  }

  toPublicJSON() {
    return {
      id: this.id,
      uploadedAt: this.uploadedAt,
      size: this.size
    };
  }

  toJSON() {
    return {
      id: this.id,
      uploadedAt: this.uploadedAt,
      size: this.size
    };
  }
};
