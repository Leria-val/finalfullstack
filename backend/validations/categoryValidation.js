import Joi from "joi";

export const categorySchema = Joi.object({
    name: Joi.string()
        .min(3) 
        .max(50) 
        .required()
        .messages({
            'string.min': 'O nome da categoria deve ter pelo menos 3 caracteres',
            'any.required': 'O nome da categoria é obrigatório'
        }),
    description: Joi.string()
        .max(255)
        .allow('', null) // Permite que seja opcional o estéja vacío
});