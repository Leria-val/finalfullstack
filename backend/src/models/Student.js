import { DataTypes } from "sequelize";
import sequelize from "../config/connection.js";
import User from './User.js';

const Student = sequelize.define("Student", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    },
    onDelete: 'CASCADE' //se deletar user deleta student
  },
  registration_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: 'Nmro de Matrícula gerado automaticamente ou manual'
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED'), //Iniciante, intermediario, avanzado
    defaultValue: 'ACTIVE'
  },
  musical_level: {
    type: DataTypes.STRING, //Iniciante, intermediario, avanzado
    allowNull: true
  }
},  

{ underscored: true,
  timestamps: false 
});

//relacionamentos
Student.belongTo(User, { foreignKey: 'user_id', as: 'authInfo' });
User.hasOne(Student, {foreignKey:'user_id', as: 'studentProfile' });

export default Student; 