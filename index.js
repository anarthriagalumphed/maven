// Require the necessary discord.js classes
require('dotenv').config();
const { Client, GatewayIntentBits, Collection, ActivityType, Guild } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// When the client is ready, run this code (only once).
// Function untuk mengubah status bot
function updateStatus() {
  // Daftar aktivitas yang mungkin diubah setiap jam
  const activities = [
    { name: 'Your Bullshit', type: ActivityType.Listening },
    { name: 'With Anarthria', type: ActivityType.Playing },
    { name: 'Bunch of Codes', type: ActivityType.Watching },
  ];

  // Pilih aktivitas secara acak dari daftar
  const randomActivity = activities[Math.floor(Math.random() * activities.length)];

  // Atur aktivitas bot
  client.user.setActivity(randomActivity.name, { type: randomActivity.type });
}

// Ketika bot sudah siap, jalankan kode ini (hanya sekali).
client.once('ready', () => {
  console.log(`Your bot is Launch ${client.user.tag}`);

  // Pertama kali atur status
  updateStatus();

  // Setelah itu, atur status setiap jam
  setInterval(() => {
    updateStatus();
  }, 3600000); // 1 jam = 3600000 milidetik
});

// Log in to Discord with your client's token
client.login(process.env.TOKEN);

const fs = require('node:fs');
const path = require('node:path');

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
  }
}

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) {
    return;
  }

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
    } else {
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  }
});
