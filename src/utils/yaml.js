const YAML = require('yaml');

const parseYaml = file => {
  try {
    return YAML.parse(file);
  }
  catch(error) {
    return {error};
  }
};

const toYaml = obj => YAML.stringify(obj);

module.exports = {
  parseYaml,
  toYaml
};
