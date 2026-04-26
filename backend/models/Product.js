import { DataTypes, DATE } from "sequelize";
import { sequelize } from "../config/connection.js";
import Category  from "./Category.js";

const Product = sequelize.define("Product",{
    name:{
        type: DataTypes.STRING,
        allowNull: false
    },
    price:{
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        min: 0
    },
    description: { 
        type: DataTypes.TEXT },
        
    categoryId:{
        type: DataTypes.INTEGER,
        references:{
            model:Category,
            key: "id"
        }
    }
})

Category.hasMany(Product, {foreignKey:"categoryId", as: "products"})
Product.belongsTo(Category,{foreignKey:"categoryId",as: "category"})

export default Product;