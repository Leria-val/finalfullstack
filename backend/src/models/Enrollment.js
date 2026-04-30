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
      model: Student, 
      key: 'id' }
  },

  class_id: {
   type: DataTypes.UUID,
    allowNull: false,
    references: { 
      model: Class, 
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
Student.belongsToMany(Class, { through: Enrollment, foreignKey: 'student_id' });
Class.belongsToMany(Student, { through: Enrollment, foreignKey: 'class_id' });

Enrollment.belongsTo(Student, { foreignKey: 'student_id' });
Enrollment.belongsTo(Class, { foreignKey: 'class_id' });

export default Enrollment;