const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const assert = require('assert');

const assertAcceptFile = (fileName, accept = []) => {
  const fileExtension = path.extname(fileName);
  if(accept.length) {
    assert(accept.includes(fileExtension), `Accept only ${accept}`);
  }
};

const loadFile = (filePath, accept = []) => {
  const _path = filePath.startsWith('/') ? filePath : `${process.cwd()}/${filePath}`;
  const fileName = path.basename(filePath);

  assertAcceptFile(fileName, accept);

  return {
    name: fileName,
    file: fs.createReadStream(_path)
  };
};

const createFormData = (filePath, accept) => {
  const {file, name} = loadFile(filePath, accept);
  const formData = new FormData();

  formData.append('file', file, name);

  return formData;
};

module.exports = {
  loadFile,
  createFormData
};
