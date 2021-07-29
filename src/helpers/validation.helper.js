const Joi = require('@hapi/joi');

const createUser = Joi.object({
  email: Joi.string().email().required(),
  phone: Joi.string().regex(/[0-9]{10}/).optional(),
  password: Joi.string().required(),
  username: Joi.string().required()
})

const editUser = Joi.object({
  username: Joi.string().optional()
})

const userLogin = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required()
})

const resetPassword = Joi.object({
  reset_password_hash: Joi.string().required(),
  password: Joi.string().required()
})

module.exports = {
  createUser,
  userLogin,
  resetPassword,
  editUser
};

