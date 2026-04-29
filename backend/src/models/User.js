import { DataTypes } from 'sequelize';
import { sequelize } from '../config/connection.js';
import bcrypt from 'bcrypt';


const User = sequelize.define('User', {

  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },

  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
     validate: {
      len: [6, 100]
    }
  },
  role:{
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'STUDENT',
     validate: {
      isIn: [['ADMIN', 'TEACHER', 'STUDENT']]
    }
  }
}, {
  hooks: {
    beforeSave: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
     }
    },

  defaultScope: {
    attributes: { exclude: ['password'] }
  },
  scopes: {
    withPassword: { attributes: {} }
  }
});

User.prototype.comparePassword =  async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default User;