import { DataTypes } from "sequelize";
import { sequelize } from "../config/connection.js";
import Student from "./Student.js";
import Class from "./Class.js";

const Enrollment = sequelize.define("Enrollment", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    //autoIncrement: true,
  },

  student_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { 
      model: 'students', 
      key: 'id' }
  },

  class_id: {
   type: DataTypes.UUID,
    allowNull: false,
    references: { 
      model: 'classes', 
      key: 'id' }
  },

  enrollment_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  
  status: {
    type: DataTypes.ENUM('ACTIVE', 'COMPLETED', 'DROPPED'),
    defaultValue: 'ACTIVE'
  }
}, { 
  underscored: true,
  timestamps: true 
});

// Relacionamento N:N
Student.belongsToMany(Class, { through: Enrollment, foreignKey: 'student_id', as: 'classes' });
Class.belongsToMany(Student, { through: Enrollment, foreignKey: 'class_id', as: 'students' });

Enrollment.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });
Enrollment.belongsTo(Class, { foreignKey: 'class_id', as: 'class' });

export default Enrollment;