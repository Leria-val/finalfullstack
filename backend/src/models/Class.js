import { DataTypes } from "sequelize";
import { sequelize } from "../config/connection.js";
import User from "./User.js";

const Class = sequelize.define("Class", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true

  },

  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { notEmpty: true }
  },

  subject: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Instrumento ou teoria (ex: Piano, Teoria Musical ||)'
  },

  period: {
    type: DataTypes.ENUM ('MORNING', 'AFTERNOON', 'NIGHT'),
    allowNull: false,
    defaultValue: 'MORNING',
  },

   room: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Sala física ou linkda sala virtual'
  },

  teacher_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
  },
}, { 
  underscored: true,
  timestamps: true 
});

// Relacionamento: Uma turma pertence a um professor (User)
Class.belongsTo(User, { foreignKey: "teacher_id", as: "teacher" });
User.hasMany(Class, { foreignKey: "teacher_id", as: "classes" });

export default Class;