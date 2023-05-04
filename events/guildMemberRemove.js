const { Events, EmbedBuilder } = require("discord.js");

const config = require("../config.json");

module.exports = {
  name: Events.GuildMemberRemove,
  async execute(member) {
    let roles = "";
    member.roles.cache.forEach(role => {
      roles += "<@&" + role.id + ">, "
    });

    roles = roles.slice(0, -(", <@&896778528537451640>, ".length));
    if (roles === "") roles = "None";
    
    const auditChannel = await member.guild.channels.cache.get(config.channels.audit_logs);
    const memberJoinEmbed = new EmbedBuilder()
      .setColor(0xff3d3d)
      .setAuthor({ name: `${member.user.tag}`, iconURL: member.user.displayAvatarURL() })
      .setDescription(`${member.user.tag} left the server!`)
      .addFields(
        { name: 'Joined Server', value: `<t:${Math.floor(member.joinedTimestamp/1000)}:F>` },
        { name: 'Account Created', value: `<t:${Math.floor(member.user.createdTimestamp/1000)}:R>`},
        { name: "Roles", value: roles },
        { name: 'Member Count', value: `${member.guild.memberCount} Members` },
      )
      .setTimestamp()

    auditChannel.send({ embeds: [memberJoinEmbed] });
  }
};