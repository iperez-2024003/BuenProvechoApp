'use strict';

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('refresh_tokens', {
    id: {
      type: Sequelize.STRING(32),
      allowNull: false,
      primaryKey: true,
    },
    token: {
      type: Sequelize.STRING(256),
      allowNull: false,
      unique: true,
    },
    user_id: {
      type: Sequelize.STRING(16),
      allowNull: false,
    },
    expires_at: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    revoked: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
  });

  await queryInterface.addIndex('refresh_tokens', ['user_id']);
  await queryInterface.addIndex('refresh_tokens', ['expires_at']);
}

export async function down(queryInterface) {
  await queryInterface.dropTable('refresh_tokens');
}
