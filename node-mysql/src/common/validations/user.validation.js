const Joi = require("joi");

const baseUserSchema = Joi.object({
  name: Joi.string().trim().min(2),
  email: Joi.string().email(),
  phone: Joi.string().pattern(/^[0-9]{10}$/),
  role: Joi.string().min(2),
  joining_date: Joi.date().max("now")
}).unknown(false);

exports.createUserSchema = baseUserSchema.fork(
  ["name", "email", "phone", "role", "joining_date"],
  schema => schema.required()
);

exports.updateUserSchema = baseUserSchema.min(1);

exports.userIdParamSchema = Joi.object({
  user_id: Joi.number().integer().required()
});