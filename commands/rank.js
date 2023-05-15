const config = require("../config.json");

const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');

const { MongoClient } = require("mongodb");
const { join } = require('path')
const { registerFont, createCanvas, loadImage } = require('canvas');

registerFont(__dirname + '/../fonts/Adumu.ttf', { family: "Adumu" });

const { request } = require('undici');

const client = new MongoClient(config.database.uri);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('Checks user rank.')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('The user you would like to check.')
    ),
  async execute(interaction) {
    if (interaction.channelId !== config.channels.bots) return await interaction.reply({ content: `Please use <#${config.channels.bots}>.`, ephemeral: true });
    await interaction.deferReply();
    const database = client.db('TallGrassBot');
    const users = database.collection('UserInfo');
    const discordUser = await interaction.options.getUser('user') || interaction.user;

    const databaseUser = await users.findOne({ USER_ID: discordUser.id });
    if (!databaseUser) {
      return await interaction.editReply(`User **${discordUser.tag}** has no data.`);
    }

    let orderedUsers = await users.find().sort({ LEVEL: 1, SCORE: 1 }).toArray();
    orderedUsers.reverse();

    const leaderboardRank = orderedUsers.indexOf(orderedUsers.find(element => element.USER_ID === databaseUser.USER_ID));

    const canvas = createCanvas(1080, 1920);
    const ctx = canvas.getContext('2d');

    const type = databaseUser.TYPE || 'Steel';
    ctx.fillStyle = changeColorAlpha(config.colors[type], 0.2);
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = config.colors[type];

    ctx.lineWidth = 30;
    ctx.beginPath();
    ctx.moveTo(50, 875);
    ctx.lineTo(400, 875);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(1030, 875);
    ctx.lineTo(680, 875);
    ctx.stroke();

    const typeImage = await loadImage(join(__dirname, '..', 'icons', `${(databaseUser.TYPE.toLowerCase() || 'normal')}.png`));
    ctx.drawImage(typeImage, canvas.width / 2 - 90, 785, 180, 180);

    ctx.lineWidth = 60;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = config.colors[type];
    ctx.font = `${Math.min(Math.max((1 / discordUser.username.length) * 1700, 100), 150)}px Adumu`;

    ctx.textAlign = "center";
    ctx.textBaseline = 'top';
    ctx.fillText(`${discordUser.username}`, canvas.width / 2, 620);

    ctx.font = '90px';
    ctx.textBaseline = 'bottom';
    ctx.textAlign = "start";
    ctx.fillText('Rank', 109, 1100);
    ctx.textAlign = "end";
    ctx.fillText(`#${leaderboardRank + 1}`, 970, 1100);

    ctx.textAlign = "start";
    ctx.fillText('Level', 109, 1400);
    ctx.textAlign = "end";
    ctx.fillText(`${databaseUser.LEVEL}`, 970, 1400);

    ctx.textAlign = "start";
    ctx.fillText('XP', 109, 1700);
    ctx.textAlign = "end";
    ctx.fillText(`${databaseUser.SCORE}/${databaseUser.LEVEL * 100}`, 970, 1700);

    ctx.strokeStyle = config.colors[type];
    ctx.lineWidth = canvas.width * (1 / 20);
    ctx.beginPath();
    ctx.arc(canvas.width / 2, 340, 190, 0, Math.PI * 2, true);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(canvas.width / 2, 340, 190, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();

    const avatar = await loadImage(discordUser.displayAvatarURL({ extension: 'png' }));
    ctx.drawImage(avatar, canvas.width / 2 - 190, 150, 380, 380);

    const attachment = new AttachmentBuilder(canvas.createPNGStream(), { name: 'profile-image.png' });
    return await interaction.editReply({ files: [attachment] });
  },
};

function changeColorAlpha(color, opacity) {
  //if it has an alpha, remove it
  if (color.length > 7)
    color = color.substring(0, color.length - 2);

  // coerce values so ti is between 0 and 1.
  const _opacity = Math.round(Math.min(Math.max(opacity, 0), 1) * 255);
  let opacityHex = _opacity.toString(16).toUpperCase()

  // opacities near 0 need a trailing 0
  if (opacityHex.length == 1)
    opacityHex = "0" + opacityHex;

  return color + opacityHex;
}