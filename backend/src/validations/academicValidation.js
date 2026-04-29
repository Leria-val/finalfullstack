import Joi from "joi";

export const classSchema = Joi.object({
  name: Joi.string().min(3).required(),
  subject: Joi.string().required(),
  teacherId: Joi.number().integer().required()
});

export const enrollSchema = Joi.object({
  studentId: Joi.number().integer().required(),
  classId: Joi.number().integer().required()
});