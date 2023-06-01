const { Events } = require('discord.js');
const { Sequelize, DataTypes } = require('sequelize');
const config = require("../config.json");

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

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    // Ignore Bots //
    if (message.author.bot) return;
    if (message.channel.id === config.channels.roles) return await message.delete();

    if (message.mentions.has(config.client.id)) {
      message.react('👋');
    }

    // Profanity //
    // if (message.channel.id !== '995778365892067468') {
    //   for (let word of words) {
    //     if (message.content.toLowerCase().includes(` ${word} `)) {
    //       await message.delete();
    //       return await message.channel.send(`<@${message.author.id}>, please avoid using profanity on this server.`);
    //     }
    //   }
    // }

    // Get User from Database //
    let user = await Users.findOne({ where: { userId: message.author.id }});
    
    // If the user does not exist, create a new one //
    if (!user) {
      await Users.create({ userId: message.author.id });
      return;
    }

    // Get Time //
    let now = new Date();

    // Check Time Delay //
    if (parseInt(user.timeout) > now.getTime()) {
      let j = new Date(parseInt(user.timeout) - now.getTime());
      return;
    }

    const randomNumber = Math.floor(Math.random() * 11) + 15;

    // Add XP to user //
    await Users.update({ score: user.score + randomNumber, timeout: `${now.getTime() + (60 * 100)}` }, { where: { userId: message.author.id }});

    // Get updated user //
    user = await Users.findOne({ where: { userId: message.author.id }});
    
    // check user level //
    if (user.level * 100 - user.score <= 0) {
      // Get #bots channel and notify user //
      const botChannel = message.guild.channels.cache.get(config.channels.bots);
      await botChannel.send(`<@${user.userId}> grew to Level ${user.level + 1}!`);

      // Update user level //
      await Users.update({ level: user.level + 1, score: 0 }, { where: { userId: message.author.id }});

      if ((user.level + 1) % 5 === 0 && user.level + 1 >= 5 && user.level + 1 <= 60) {
        const previousLevelRole = await message.guild.roles.cache.find(role => role.name === `Level ${user.level - 4}`);
        const levelRole = await message.guild.roles.cache.find(role => role.name === `Level ${user.level + 1}`);

        const guildUser = await message.guild.members.cache.get(message.author.id);

        if (previousLevelRole) {
          guildUser.roles.remove(previousLevelRole);
        }

        guildUser.roles.add(levelRole);

        switch (user.level + 1) {
          case 15:
            if (!user.pokemonType) return await botChannel.send(`Be sure to join a type using </type:${config.commands.type}>.`);
            message.guild.members.cache.get(message.author.id).roles.add(config.roles.types[user.pokemonType + " Stage 1"]);
            message.guild.members.cache.get(message.author.id).roles.remove(config.roles.types[user.pokemonType]);
            await botChannel.send(`<@${user.userId}> was given the role <@&${config.roles.types[user.pokemonType + " Stage 1"]}>!`);
            break;
          case 30:
            if (!user.pokemonType) return await botChannel.send(`Be sure to join a type using </type:${config.commands.type}>.`);
            message.guild.members.cache.get(message.author.id).roles.add(config.roles.types[user.pokemonType + " Stage 2"]);
            message.guild.members.cache.get(message.author.id).roles.remove(config.roles.types[user.pokemonType + " Stage 1"]);
            await botChannel.send(`<@${user.userId}> was given the role <@&${config.roles.types[user.pokemonType + " Stage 2"]}>!`);
            break;
          default:
            break;
        }
      }
    }
  }
};