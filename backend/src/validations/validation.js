import Joi from "joi";

export const classSchema = Joi.object({
  name: Joi.string().min(3).required().messages({
    'string.min': 'O nome da turma deve ter pelo menos 3 caracteres'
  }),
  subject: Joi.string().required(),
  teacher_id: Joi.number().integer().required(), // Voltamos para number pois User usa ID incremental
  period: Joi.string().valid('MORNING', 'AFTERNOON', 'NIGHT').required(),
  room: Joi.string().allow('', null) // Opcional
});

export const enrollSchema = Joi.object({
  // Como Student e Class usam UUID, o Joi precisa validar como string/guid
  student_id: Joi.string().guid({ version: 'uuidv4' }).required(),
  class_id: Joi.string().guid({ version: 'uuidv4' }).required()
});

// validação de Notas (Grade)
export const gradeSchema = Joi.object({
  enrollment_id: Joi.string().guid({ version: 'uuidv4' }).required(),
  value: Joi.number().min(0).max(10).required().messages({
    'number.max': 'A nota máxima é 10',
    'number.min': 'A nota mínima é 0'
  })
});

export const validateBody = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const messages = error.details.map(d => d.message);
      return res.status(400).json({ errors: messages });
    }
    
    next();
  };
};