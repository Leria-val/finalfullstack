import Joi from "joi";

export const productSchema = Joi.object({
    name: Joi.string().min(3).required().messages({
        'string.empty': 'O nome não pode estar vazio',
        'string.min': 'O nome deve ter pelo menos {#limit} caracteres'
    }),
    price: Joi.number().positive().required().messages({
        'number.positive': 'O preço deve ser um valor maior que zero'
    }),
    categoryId: Joi.number().integer().required(),
    description: Joi.string().allow('', null).optional()
});