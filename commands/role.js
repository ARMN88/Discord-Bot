const config = require("../config.json");

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const { MongoClient } = require("mongodb");
const client = new MongoClient(config.database.uri);
const database = client.db('TallGrassBot');
const users = database.collection('UserInfo');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('role')
    .setDescription('Print add or remove a role.')
    .addStringOption(option =>
      option.setName('role')
        .setDescription('The role you want.')
        .setRequired(true)
        .addChoices(
          { name: 'VC', value: config.roles.VC },
          { name: 'Weeb', value: config.roles.Weeb },
          { name: 'Gamer', value: config.roles.Gamer },
          { name: 'Cinema', value: config.roles.Cinema },
          { name: 'Team Jotchua', value: config.roles["Team Jotchua"] },
          { name: 'Team Jose Luis', value: config.roles["Team Jose Luis"] },
          { name: "Red", value: config.roles.Red },
          { name: "Orange", value: config.roles.Orange },
          { name: "Yellow", value: config.roles.Yellow },
          { name: "Green", value: config.roles.Green },
          { name: "Blue", value: config.roles.Blue },
          { name: "Purple", value: config.roles.Purple },
        )),
  async execute(interaction) {
    // Check if the user is in #roles //
    if (interaction.channelId !== config.channels.roles) return await interaction.reply({content: `Please use <#${config.channels.roles}>.`, ephemeral: true})

    const user = await users.findOne({ USER_ID: interaction.member.id });
    if(!user) return await interaction.reply({content: `You must be Level 10 or higher.`, ephemeral: true});
    if(user.LEVEL < 10) return await interaction.reply({content: `You must be Level 10 or higher. Only ${10 - user.LEVEL} level(s) to go!`, ephemeral: true});
    // Get Selected Role //
    const selectedRole = interaction.options.getString('role');

    // Remove Role //
    if (interaction.member.roles.cache.has(selectedRole)) {
      interaction.member.roles.remove(selectedRole);
      const roleRemovedEmbed = new EmbedBuilder()
        .setColor(0xff2b2b)
        .setTitle('Role Removed')
        .setAuthor({ name: interaction.member.displayName, iconURL: interaction.member.displayAvatarURL() })
        .setDescription(`Role <@&${selectedRole}> removed.`)
      return await interaction.reply({ embeds: [roleRemovedEmbed] });
    }

    // Add Role //
    interaction.member.roles.add(selectedRole);
    const roleAddedEmbed = new EmbedBuilder()
      .setColor(0x2bff59)
      .setTitle('Role Added')
      .setAuthor({ name: interaction.member.displayName, iconURL: interaction.member.displayAvatarURL() })
      .setDescription(`Role <@&${selectedRole}> added.`)

    return await interaction.reply({ embeds: [roleAddedEmbed] });
  },
};