const { Events, AttachmentBuilder, EmbedBuilder } = require('discord.js');

const config = require("../config.json");

const { createCanvas, registerFont, loadImage, Image } = require('canvas');
registerFont(__dirname + '/../fonts/Pokemon.ttf', { family: 'Pokemon' })

const { request } = require('undici');

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    const user = await member.fetch();
    
    const canvas = createCanvas(1080, 720);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = "#D4E1EE";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#EDE8A8";
    ctx.beginPath();
    ctx.ellipse(790, 300, 290, 75, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#B6E484";
    ctx.beginPath();
    ctx.ellipse(790, 300, 255, 60, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#C3F694";
    ctx.beginPath();
    ctx.ellipse(790, 300, 230, 50, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#EDE8A8";
    ctx.beginPath();
    ctx.ellipse(275, 530, 290, 75, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#B6E484";
    ctx.beginPath();
    ctx.ellipse(275, 530, 255, 60, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#C3F694";
    ctx.beginPath();
    ctx.ellipse(275, 530, 230, 50, 0, 0, Math.PI * 2);
    ctx.fill();

    // ctx.fillStyle = "#4F645F";
    // ctx.strokeStyle = "#4F645F";
    // ctx.lineWidth = 10;
    // roundRect(ctx, 70, 85, 470, 190);

    // ctx.fillStyle = "#FBF7D8";
    // ctx.strokeStyle = "#2D3B24";
    // ctx.lineWidth = 10;
    // roundRect(ctx, 60, 75, 460, 180);

    const avatar1 = await loadImage(__dirname + "/../icons/image.png");
    ctx.drawImage(avatar1, 0, 200, 600, 600);

    ctx.fillStyle = "#303134";
    ctx.fillRect(0, 500, canvas.width, canvas.height);

    ctx.strokeStyle = "#C9A74E";
    ctx.fillStyle = "#C9A74E";
    ctx.lineWidth = 20;
    roundRect(ctx, 20, 520, canvas.width - 20, canvas.height - 20);

    ctx.strokeStyle = "#FFFFFF";
    ctx.fillStyle = "#FFFFFF";
    ctx.lineWidth = 8;
    roundRect(ctx, 34, 534, canvas.width - 34, canvas.height - 34);

    ctx.strokeStyle = "#2A5067";
    ctx.fillStyle = "#2A5067";
    ctx.lineWidth = 8;
    roundRect(ctx, 42, 542, canvas.width - 42, canvas.height - 42);

    ctx.font = "40px Pokemon";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(`Wild  ${user.displayName} appeared!`, 50, 600, 1000);

    const profile = {
      x: 790,
      y: 240,
      size: 200,
    }

    ctx.strokeStyle = user.displayHexColor || "#FFFFFF";
    ctx.lineWidth = 15;
    ctx.beginPath();
    ctx.arc(profile.x, profile.y, profile.size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(profile.x, profile.y, profile.size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    const avatar = await loadImage(user.displayAvatarURL({ extension: 'png' }));
    ctx.drawImage(avatar, profile.x - (profile.size / 2), profile.y - (profile.size / 2), profile.size, profile.size)
    
    const attachment = new AttachmentBuilder(canvas.createPNGStream(), { name: 'join-image.png' });
    
    const welcomeChannel = await member.guild.channels.cache.get(config.channels.welcome);
    welcomeChannel.send({ content: `A wild <@${user.id}> appeared! Welcome to **The Tall Grass**!`, files: [attachment] });

    const trainerRole = await member.guild.roles.cache.get(config.roles.Trainer);
    member.roles.add(trainerRole);

    const auditChannel = await member.guild.channels.cache.get(config.channels.audit_logs);
    const memberJoinEmbed = new EmbedBuilder()
      .setColor(0xa434eb)
      .setAuthor({ name: `${member.user.tag}`, iconURL: user.displayAvatarURL() })
      .setDescription(`<@${member.user.id}> joined!`)
      .addFields(
        { name: 'Joined Server', value: `<t:${Math.floor(member.joinedTimestamp/1000)}:F>` },
        { name: 'Account Created', value: `<t:${Math.floor(member.user.createdTimestamp/1000)}:R>`, },
        { name: 'Member Count', value: `${user.guild.memberCount} Members`, },
      )
      .setTimestamp()

    auditChannel.send({ embeds: [memberJoinEmbed] });
  },
};

function roundRect(ctx, x, y, width, height) {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(x + (ctx.lineWidth / 2), y + (ctx.lineWidth / 2));
  ctx.lineTo(width - (ctx.lineWidth / 2), y + (ctx.lineWidth / 2));
  ctx.lineTo(width - (ctx.lineWidth / 2), height - (ctx.lineWidth / 2));
  ctx.lineTo(x + (ctx.lineWidth / 2), height - (ctx.lineWidth / 2));
  ctx.lineTo(x + (ctx.lineWidth / 2), y + (ctx.lineWidth / 2));
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(width, y);
  ctx.lineTo(width, height);
  ctx.lineTo(x, height);
  ctx.lineTo(x, y);
  ctx.stroke();
}