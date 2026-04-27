import { DataTypes } from "sequelize";
import { sequelize } from "../config/connection.js";
import Student from "./Student.js";
import Class from "./Class.js";

const Enrollment = sequelize.define("Enrollment", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  studentId: {
    type: DataTypes.INTEGER,
    references: { model: Student, key: 'id' }
  },
  classId: {
    type: DataTypes.INTEGER,
    references: { model: Class, key: 'id' }
  }
}, { timestamps: true });

// Relacionamento N:N
Student.belongsToMany(Class, { through: Enrollment, foreignKey: 'studentId' });
Class.belongsToMany(Student, { through: Enrollment, foreignKey: 'classId' });

export default Enrollment;