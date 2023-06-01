const { Sequelize, DataTypes } = require('sequelize');

const database = new Sequelize({
  dialect: 'sqlite',
  storage: 'users.db',
  logging: false,
  query: {
    raw: true
  }
});

const Users = database.define('Users', {
  userId: {
    type: DataTypes.TEXT
  },
  level: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  score: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  pokemonType: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  timeout: {
    type: DataTypes.TEXT,
    defaultValue: '0'
  }
}, { timestamps: false });