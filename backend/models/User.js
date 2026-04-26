import { DataTypes } from 'sequelize';
import { sequelize } from '../config/connection.js';
import bcrypt from 'bcrypt';


const User = sequelize.define('User', {
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
    defaultValue: 'user',
     validate: {
      isIn: [['user', 'admin']]
    }
  }
}, {
  hook: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

User.prototype.comparePassword =  async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default User;