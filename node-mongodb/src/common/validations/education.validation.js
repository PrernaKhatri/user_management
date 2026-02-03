const Joi = require("joi");

const objectId = Joi.string().hex().length(24);

const baseEducationSchema = Joi.object({
  education_level: Joi.string().trim().min(2),
  institution_name: Joi.string().trim().min(2),
  passing_year: Joi.number()
    .integer()
    .max(new Date().getFullYear()),
  percentage: Joi.number().min(0).max(100)
}).unknown(false);

exports.createEducationSchema = baseEducationSchema.fork(
  ["education_level", "institution_name", "passing_year", "percentage"],
  schema => schema.required()
);

exports.updateEducationSchema = baseEducationSchema.min(1);

exports.userIdParamSchema = Joi.object({
  user_id: objectId.required()
});

exports.educationIdParamSchema = Joi.object({
  education_id: objectId.required()
});

exports.userEducationParamSchema = Joi.object({
  user_id: objectId.required(),
  education_id: objectId.required()
});
