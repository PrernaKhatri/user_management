const Joi = require("joi");

const baseUserSchema = Joi.object({
  name: Joi.string().trim().min(2),
  email: Joi.string().email().lowercase(),
  phone: Joi.string().pattern(/^[0-9]{10}$/),
  role: Joi.string(),
  joining_date: Joi.date().max("now"),
  profile_picture: Joi.string().uri()
}).unknown(false);

exports.createUserSchema = baseUserSchema.fork(
  ["name", "email", "phone", "role", "joining_date"],
  (schema) => schema.required()
);

exports.updateUserSchema = baseUserSchema.min(1);

exports.userIdParamSchema = Joi.object({
  user_id: Joi.string().hex().length(24).required()
});
