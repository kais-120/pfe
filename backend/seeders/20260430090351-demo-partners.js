'use strict';

const bcrypt = require("bcryptjs");

module.exports = {
  async up (queryInterface, Sequelize) {

    const hashedPassword = await bcrypt.hash('123456', 10);

    const partners = [];

    for (let i = 1; i <= 6; i++) {
      partners.push({
        name: `Partner ${i}`,
        email: `partner${i}@mail.com`,
        role: 'partner',
        phone: `2000000${i}`,
        password: hashedPassword,
        verified_at: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    await queryInterface.bulkInsert('users', partners, {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', {
      role: 'partner',
      email: {
        [Sequelize.Op.like]: 'partner%@mail.com'
      }
    }, {});
  }
};