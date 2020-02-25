const Joi = require('@hapi/joi');
const {isAddress} = require('web3-utils');

const validateEthAddress = (address, {message}) => {
  if(!isAddress(address)) return message(`${address} is not a valid Ethereum address`);

  return address;
};

const solidityTypesValidator = {
  bool: Joi.boolean().required(),
  int: Joi.string().regex(/^\d+$/).required(),
  uint: Joi.string().regex(/^\d+$/).required(),
  address: Joi.string().required().custom(validateEthAddress),
  string: Joi.string().required(),
  byte: Joi.string().required()
};

const parseType = type => {
  if(type.includes('uint')) {
    return 'uint';
  }
  if(type.includes('int')) {
    return 'int';
  }
  if(type.includes('byte')) {
    return 'byte';
  }
  return type;
};

const createSchemaObj = (inputs, params) => {
  const schema = {};

  inputs.forEach(({name, type, components}) => {
    if(type === 'tuple') {
      schema[name] = createSchemaObj(components, params[name]);
    }
    else if(type === 'tuple[]') {
      schema[name] = Joi.array().items(createSchemaObj(components, params[name]));
    }
    else if(type.endsWith('[]')) {
      schema[name] = Joi.array().items(solidityTypesValidator[parseType(type.slice(0, -2))]);
    }
    else {
      schema[name] = solidityTypesValidator[parseType(type)];
    }
  });

  return Joi.object(schema).required();
};

const validate = (inputs, params = {}) => {
  const schema = createSchemaObj(inputs, params);

  Joi.assert(params, schema, 'Invalid input parameters');

  return params;
};

module.exports = validate;
