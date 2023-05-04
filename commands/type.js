const config = require("../config.json");

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const { MongoClient } = require("mongodb");
const client = new MongoClient(config.database.uri);
const database = client.db('TallGrassBot');
const users = database.collection('UserInfo');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('type')
    .setDescription('Allows you to select a type.')
    .addStringOption(option =>
      option.setName('types')
        .setDescription('The type you would like to join.')
        .setRequired(false)
        .addChoices(
          { name: 'Fire', value: config.roles.types.Fire },
          { name: 'Water', value: config.roles.types.Water },
          { name: 'Grass', value: config.roles.types.Grass },
          { name: 'Electric', value: config.roles.types.Electric },
          { name: 'Psychic', value: config.roles.types.Psychic },
          { name: 'Fighting', value: config.roles.types.Fighting },
          { name: 'Dark', value: config.roles.types.Dark },
          { name: 'Steel', value: config.roles.types.Steel },
          { name: 'Fairy', value: config.roles.types.Fairy },
          { name: 'Dragon', value: config.roles.types.Dragon },
          { name: 'Ice', value: config.roles.types.Ice },
          { name: 'Poison', value: config.roles.types.Poison },
          { name: 'Ground', value: config.roles.types.Ground },
          { name: 'Flying', value: config.roles.types.Flying },
          { name: 'Bug', value: config.roles.types.Bug },
          { name: 'Rock', value: config.roles.types.Rock },
          { name: 'Ghost', value: config.roles.types.Ghost }
        )),
  async execute(interaction) {
    if (interaction.channelId !== config.channels.roles) return await interaction.reply({content: `Please use <#${config.channels.roles}>.`, ephemeral: true})
    
    let user = await users.findOne({ USER_ID: interaction.member.id });
    if (!user) {
      await users.insertOne({
        USER_ID: interaction.member.id,
        SCORE: 0,
        LEVEL: 1,
        TOTAL: 0,
        TIMEOUT: 0,
        TYPE: ''
      });
      user = await users.findOne({ USER_ID: interaction.member.id });
    }
    
    const selectedId = await interaction.options.getString('types');
    if(!selectedId) {
      await users.updateOne(
        { USER_ID: interaction.member.id },
        {
          $set: {
            'TYPE': ''
          }
        }
      );
      for(let type of Object.values(config.roles.types)) {
        if(interaction.member.roles.cache.has(type)) {
          interaction.member.roles.remove(type);
          break;
        }
      }
      
      return await interaction.reply("Type has been cleared.");
    }

    let selectedRole = await interaction.guild.roles.cache.get(selectedId);
    await users.updateOne(
      { USER_ID: interaction.member.id },
      {
        $set: {
          'TYPE': selectedRole.name
        }
      }
    );

    for(let type of Object.values(config.roles.types)) {
      if(interaction.member.roles.cache.has(type)) {
        interaction.member.roles.remove(type);
        break;
      }
    }

    if (user.LEVEL >= 30) {
      selectedRole = interaction.guild.roles.cache.find(role => role.name === selectedRole.name + " Stage 2");
    } else if (user.LEVEL >= 15) {
      selectedRole = interaction.guild.roles.cache.find(role => role.name === selectedRole.name + " Stage 1");
    }
    interaction.member.roles.add(selectedRole);
    return await interaction.reply(`Successfully joined <@&${selectedRole.id}>!`);
  },
};