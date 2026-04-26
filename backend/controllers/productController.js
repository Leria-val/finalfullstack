import Product from "../models/Product.js";
import Category from "../models/Category.js";
import { Op } from "sequelize";

const productController = {
  getAll: async (req, res) => {
    try {
      const { categoryId, minPrice, maxPrice, order } = req.query;

      const where = {};

      if (categoryId) where.categoryId = categoryId;

      if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) where.price[Op.gte] = Number(minPrice);
        if (maxPrice) where.price[Op.lte] = Number(maxPrice);
      }

      const products = await Product.findAll({
        where,
        order: [["price", order === "desc" ? "DESC" : "ASC"]],
        include: {
          model: Category,
          as: "category",
          attributes: ["id", "name"]
        },
      });

      return res.status(200).json({
        success: true,
        data: products,
        message: "Produtos listados com sucesso!",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Erro ao listar produtos",
        error: error.message,
      });
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params;

      const product = await Product.findByPk(id, {
        include: {
          model: Category,
          as: "category",
        },
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Produto não encontrado",
        });
      }

      return res.status(200).json({
        success: true,
        data: product,
        message: "Produto encontrado com sucesso!",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Erro ao buscar produto",
        error: error.message,
      });
    }
  },

  create: async (req, res) => {
    try {
      const { name, price, categoryId, description } = req.body;

      if (!name || !price || !categoryId) {
        return res.status(400).json({
          success: false,
          message: "Campos obrigatórios: name, price e categoryId"
        });
        }

      const category = await Category.findByPk(categoryId);

      if (!category) {
        return res.status(400).json({
          success: false,
          data: null,
          message: "Categoria inválida",
        });
      }

      const product = await Product.create({
        name,
        price: Number(price),
        categoryId: Number(categoryId),
        description: description || "",
      });

      return res.status(201).json({
        success: true,
        data: product,
        message: "Produto criado com sucesso!",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Erro ao criar produto",
        error: error.message,
      });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, price, categoryId, description } = req.body;

      const product = await Product.findByPk(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          data: null,
          message: "Produto não encontrado",
        });
      }

      if (categoryId) {
        const category = await Category.findByPk(categoryId);

        if (!category) {
          return res.status(400).json({
            success: false,
            data: null,
            message: "Categoria inválida",
          });
        }
      }

      await product.update({
        name: name || product.name,
        price: price ? Number(price) : product.price,
        description: description !== undefined ? description : product.description,
        categoryId: categoryId ? Number(categoryId) : product.categoryId
      });

      await product.reload();

      return res.status(200).json({
        success: true,
        data: product,
        message: "Produto atualizado com sucesso!",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Erro ao atualizar produto",
        error: error.message,
      });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;

      const product = await Product.findByPk(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          data: null,
          message: "Produto não encontrado",
        });
      }

      await product.destroy();

      return res.status(200).json({
        success: true,
        data: null,
        message: "Produto removido com sucesso!",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Erro ao remover produto",
        error: error.message,
      });
    }
  },
};

export default productController;
