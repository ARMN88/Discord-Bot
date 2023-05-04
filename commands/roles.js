const config = require("../config.json");

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const roles = [
  config.roles.Red,
  config.roles.Orange,
  config.roles.Yellow,
  config.roles.Green,
  config.roles.Blue,
  config.roles.Purple,
  config.roles.Weeb,
  config.roles.Gamer,
  config.roles.Cinema,
  config.roles.VC
]

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roles')
    .setDescription('Print all roles.'),
  async execute(interaction) {
    if (interaction.channelId !== config.channels.roles) return await interaction.reply({content: `Please use <#${config.channels.roles}>.`, ephemeral: true})
    let roleString = '';

    for (let role of roles) {
      roleString += `<@&${role}>\n`
    }

    const rolesEmbed = new EmbedBuilder()
      .setColor(0x292929)
      .setTitle('Roles')
      .setDescription(roleString)

    return await interaction.reply({ embeds: [rolesEmbed] });
  },
};