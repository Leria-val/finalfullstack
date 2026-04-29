import { DataTypes } from "sequelize";
import { sequelize } from "../config/connection.js";
import User from "./User.js";

const Class = sequelize.define("Class", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  subject: {
    type: DataTypes.STRING, // Disciplina (ex: Programação FullStack)
    allowNull: false,
  },
  teacherId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: "id",
    },
  },
}, { timestamps: true });

// Relacionamento: Uma turma pertence a um professor (User)
Class.belongsTo(User, { foreignKey: "teacherId", as: "teacher" });
User.hasMany(Class, { foreignKey: "teacherId", as: "classes" });

export default Class;