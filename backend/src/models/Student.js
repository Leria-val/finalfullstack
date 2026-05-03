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
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE' //se deletar user deleta student
  },
  registration_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED'), //Iniciante, intermediario, avanzado
    defaultValue: 'ACTIVE'
  },
  musical_level: {
    type: DataTypes.STRING, //Iniciante, intermediario, avanzado
    allowNull: true
  },
  
   instrument: {
    type: DataTypes.STRING,
    allowNull: true
  },

  birth_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  
phone: {
    type: DataTypes.STRING,
    allowNull: false
  }
  

}, { 
  tableName: 'students',
  underscored: true,
  timestamps: true
});

//relacionamentos
Student.belongsTo(User, { foreignKey: 'user_id', as: 'authInfo' });
User.hasOne(Student, {foreignKey:'user_id', as: 'studentProfile' });

export default Student; 