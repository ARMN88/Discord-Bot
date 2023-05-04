const { Events } = require('discord.js');

const config = require("../config.json");

const { MongoClient } = require("mongodb");
const client = new MongoClient(config.database.uri);
const database = client.db('TallGrassBot');
const usersD = database.collection('UserInfo');

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);
  },
};

async function UpdateLevels(guild) {
  const users = usersD.find();
  
  users.forEach(async user => {
    if (user.LEVEL < 5) return;
    let lvl = user.LEVEL;
    if(user.LEVEL > 60) lvl = 60;
    const guildUser = await guild.members.fetch(user.USER_ID);
    const levelRole = await guild.roles.cache.find(role => role.name === `Level ${(Math.floor(lvl / 5) * 5)}`);
    guildUser.roles.add(levelRole);
  });
}

// async function AddTypes(client) {
//   const guild = await client.guilds.fetch(config.guild);
//   for (let type of types) {
//     for (let stage of stages) {
//       let role = await guild.roles.create({
//         name: type + stage,
//         color: config.colors[type],
//         position: 3,
//         hoist: false,
//         mentionable: true
//       });
//       console.log(`"${role.name}": "${role.id}"`);
//     }
//   }
// }

// async function AddLevels(client) {
//   const guild = await client.guilds.fetch(config.guild);
//   for (let i = 5; i <= 60; i += 5) {
//     await guild.roles.create({
//       name: `Level ${i}`,
//       color: "#dbdbdb",
//       position: 1,
//       hoist: false,
//       mentionable: true
//     });
//   }
// }