const { Events } = require('discord.js');

const config = require("../config.json");

const { MongoClient } = require("mongodb");
const client = new MongoClient(config.database.uri);
const database = client.db('TallGrassBot');
const users = database.collection('UserInfo');

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
    let user = await users.findOne({ USER_ID: message.author.id });

    // If the user does not exist, create a new one //
    if (!user) {
      await users.insertOne({
        USER_ID: message.author.id,
        SCORE: 0,
        LEVEL: 1,
        TIMEOUT: 0,
        TYPE: ''
      });
      return;
    }

    // Get Time //
    let now = new Date();

    // Check Time Delay //
    if (user.TIMEOUT > now.getTime()) {
      let j = new Date(user.TIMEOUT - now.getTime());
      return;
    }

    const randomNumber = Math.floor(Math.random() * 11) + 15;

    // Add XP to user //
    await users.updateOne(
      { USER_ID: message.author.id },
      {
        $set: {
          'SCORE': user.SCORE + randomNumber,
          'TIMEOUT': now.getTime() + (60 * 1000)
        }
      }
    );

    // Get updated user //
    user = await users.findOne({ USER_ID: message.author.id });

    // check user level //
    if (user.LEVEL * 100 - user.SCORE <= 0) {
      // Get #bots channel and notify user //
      const botChannel = message.guild.channels.cache.get(config.channels.bots);
      await botChannel.send(`<@${user.USER_ID}> grew to Level ${user.LEVEL + 1}!`);

      // Update user level //
      await users.updateOne(
        { USER_ID: message.author.id },
        {
          $set: {
            'LEVEL': user.LEVEL + 1,
            'SCORE': 0
          }
        }
      );

      if ((user.LEVEL + 1) % 5 === 0 && user.LEVEL + 1 >= 5 && user.LEVEL + 1 <= 60) {
        const previousLevelRole = await message.guild.roles.cache.find(role => role.name === `Level ${user.LEVEL - 4}`);
        const levelRole = await message.guild.roles.cache.find(role => role.name === `Level ${user.LEVEL + 1}`);

        const guildUser = await message.guild.members.cache.get(message.author.id);

        if (previousLevelRole) {
          guildUser.roles.remove(previousLevelRole);
        }

        guildUser.roles.add(levelRole);

        switch (user.LEVEL + 1) {
          case 15:
            if (!user.TYPE) return await botChannel.send(`Be sure to join a type using </type:${config.commands.type}>.`);
            message.guild.members.cache.get(message.author.id).roles.add(config.roles.types[user.TYPE + " Stage 1"]);
            message.guild.members.cache.get(message.author.id).roles.remove(config.roles.types[user.TYPE]);
            await botChannel.send(`<@${user.USER_ID}> was given the role <@&${config.roles.types[user.TYPE + " Stage 1"]}>!`);
            break;
          case 30:
            if (!user.TYPE) return await botChannel.send(`Be sure to join a type using </type:${config.commands.type}>.`);
            message.guild.members.cache.get(message.author.id).roles.add(config.roles.types[user.TYPE + " Stage 2"]);
            message.guild.members.cache.get(message.author.id).roles.remove(config.roles.types[user.TYPE + " Stage 1"]);
            await botChannel.send(`<@${user.USER_ID}> was given the role <@&${config.roles.types[user.TYPE + " Stage 2"]}>!`);
            break;
          default:
            break;
        }
      }
    }
  }
};