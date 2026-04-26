import Product from "../models/Product.js";
import Category from "../models/Category.js";

const categoryController = {
  
  getAll: async (req, res) => {
    try {
      const categories = await Category.findAll({
        attributes: ["id", "name"],
      });

      return res.status(200).json({
        success: true,
        data: categories,
        message: "Categorias listadas com sucesso!",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Erro ao listar categorias",
        error: error.message,
      });
    }
  },

  create: async (req, res) => {
    try {
      const { name, description } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: "O nome da categoria é obrigatório",
        });
      }

      const category = await Category.create({ name, description });

      return res.status(201).json({
        success: true,
        data: category,
        message: "Categoria criada com sucesso!",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Erro ao criar categoria",
        error: error.message,
      });
    }
  }
};

export default categoryController;