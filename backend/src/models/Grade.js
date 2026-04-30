const { DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

const Grade = sequelize.define(
  'Grade',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    enrollmentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'enrollments', key: 'id' },
      onDelete: 'CASCADE',
    },
    teacherId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    value: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      validate: {
        min: { args: [0], msg: 'Nota mínima é 0.' },
        max: { args: [10], msg: 'Nota máxima é 10.' },
      },
    },
    period: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    tableName: 'grades',
    timestamps: true,
  }
);

Grade.associate = (models) => {
  Grade.belongsTo(models.Enrollment, {
    foreignKey: 'enrollmentId',
    as: 'enrollment',
  });

  Grade.belongsTo(models.User, {
    foreignKey: 'teacherId',
    as: 'teacher',
  });
};

module.exports = Grade;