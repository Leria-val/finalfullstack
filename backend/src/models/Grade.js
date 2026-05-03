import { DataTypes } from 'sequelize';
import { sequelize } from '../config/connection.js';

const Grade = sequelize.define(
  'Grade',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    enrollment_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'enrollments', key: 'id' },
      onDelete: 'CASCADE',
    },
    teacher_id: {
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
    underscored: true,
    timestamps: true,
  }
);

Grade.associate = (models) => {
  Grade.belongsTo(models.Enrollment, {
    foreignKey: 'enrollment_id',
    as: 'enrollment',
  });

  Grade.belongsTo(models.User, {
    foreignKey: 'teacher_id',
    as: 'teacher',
  });
};

export default Grade;