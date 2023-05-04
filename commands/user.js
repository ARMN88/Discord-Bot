const config = require("../config.json");
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('user')
    .setDescription('Provides information about the user.')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('Provides information about this user.')
        .setRequired(true)
    ),
  async execute(interaction) {
    if (interaction.channelId !== config.channels.bots) return await interaction.reply({ content: `Please use <#${config.channels.bots}>.`, ephemeral: true });

    let user = interaction.options.getUser("user");
    user = interaction.member.guild.members.cache.find(member => member.id === user.id);

    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

    let roles = "";
    user.roles.cache.forEach(role => {
      roles += "<@&" + role.id + ">, "
    });

    roles = roles.slice(0, -(", <@&896778528537451640>, ".length));
    if (roles === "") roles = "None";

    const userEmbed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setAuthor({ name: user.user.tag, iconURL: user.user.avatarURL() })
      .setThumbnail(user.user.avatarURL())
      .setTitle("Info")
      .addFields(
        { name: "Joined Discord", value: user.user.createdAt.toLocaleDateString(undefined, dateOptions) },
        { name: 'Joined Server', value: user.joinedAt.toLocaleDateString(undefined, dateOptions) },
        { name: "Roles", value: roles }
      );
    return await interaction.reply({ embeds: [userEmbed] });
  },
};