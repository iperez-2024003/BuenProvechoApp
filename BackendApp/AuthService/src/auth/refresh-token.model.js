'use strict';

import { DataTypes } from 'sequelize';
import { sequelize } from '../../configs/db.js';
import { generateUserId } from '../../helpers/uuid-generator.js';

export const RefreshToken = sequelize.define(
  'RefreshToken',
  {
    Id: {
      type: DataTypes.STRING(32),
      primaryKey: true,
      field: 'id',
      defaultValue: () => generateUserId(),
    },
    Token: {
      type: DataTypes.STRING(256),
      allowNull: false,
      unique: true,
      field: 'token',
    },
    UserId: {
      type: DataTypes.STRING(16),
      allowNull: false,
      field: 'user_id',
    },
    ExpiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'expires_at',
    },
    Revoked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      field: 'revoked',
    },
    CreatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
  },
  {
    tableName: 'refresh_tokens',
    timestamps: false,
  }
);

export default RefreshToken;
