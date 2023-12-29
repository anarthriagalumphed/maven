const { Client, GatewayIntentBits, Collection, ActivityType } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Konfigurasi dan login
client.login(process.env.TOKEN)
  .catch(error => {
    console.error(`Error during login: ${error.message}`);
  });

client.slashCommands = new Collection();

// Fungsi untuk mengubah status bot
function updateStatus() {
  const activities = [
    { name: 'Your Bullshit', type: ActivityType.Listening, url: 'https://galihmahendrastudio.com/banner.png' },
    { name: 'With Anarthria', type: ActivityType.Playing, url: 'https://galihmahendrastudio.com/banner.png' },
    { name: 'Bunch of Codes', type: ActivityType.Watching, url: 'https://galihmahendrastudio.com/banner.png' },
  ];

  const randomActivity = activities[Math.floor(Math.random() * activities.length)];
  client.user.setActivity(randomActivity.name, { type: randomActivity.type });
}

client.once('ready', async () => {
  console.log(`Your bot is Launch ${client.user.tag}`);
  updateStatus();
  setInterval(() => {
    updateStatus();
  }, 3600000);

  try {
    // Hapus cache perintah sebelumnya
    await client.application.commands.fetch(); // Memastikan cache terisi
    const existingCommands = client.application.commands.cache.array();
    await Promise.all(existingCommands.map(cmd => cmd.delete()));

    // Pendaftaran perintah global
    const slashCommands = [
      { name: 'ping', description: 'Ping command' },
    ];

    // Register perintah-perintah baru
    await client.application.commands.set(slashCommands);

    // Pendaftaran perintah lokal (dalam folder 'commands')
    const foldersPath = path.join(__dirname, 'commands');
    const commandFolders = fs.readdirSync(foldersPath);

    for (const folder of commandFolders) {
      const commandsPath = path.join(foldersPath, folder);
      const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

      for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        // Log file path for debugging
        console.log(`Command file path: ${filePath}`);

        if ('data' in command && 'execute' in command) {
          await client.application.commands.create(command.data);
          client.slashCommands.set(command.data.name, command);
        } else {
          console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
      }
    }

    console.log('Commands registered successfully.');
  } catch (error) {
    console.error(`Error during command registration: ${error.message}`);
  }

  // ... (rest of the code)

});



client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) {
    return;
  }

  const command = client.slashCommands.get(interaction.commandName);

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

// (Kode lainnya bisa ditambahkan di sini)
