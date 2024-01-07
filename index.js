const { Client, GatewayIntentBits, Collection, ActivityType } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Instantiate the client with appropriate intents
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Initialize a collection for slash commands
client.slashCommands = new Collection();

// ... (rest of your code, including command registration and event handlers)
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

client.once('ready', () => {
  console.log(`Your bot is Launch ${client.user.tag}`);
  updateStatus();
  setInterval(() => {
    updateStatus();
  }, 3600000);

  // Pendaftaran perintah global
  const slashCommands = [
    { name: 'ping', description: 'Ping command' },
  ];

  client.application.commands.set(slashCommands);

  // ... (previous code)

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
        client.application.commands.create(command.data);
        client.slashCommands.set(command.data.name, command);
      } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
      }
    }
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


// Schedule the bot to sleep and wake using Heroku Scheduler
if (process.env.NODE_ENV === 'production') { // Only schedule in production
  // Create job definitions for sleep and wake actions
  const sleepJob = {
    id: 'bot-sleep',
    schedule: `0 0 * * *`, // Sleep at midnight
    command: `node worker.js sleep`,
  };
  const wakeJob = {
    id: 'bot-wake',
    schedule: `0 7 * * *`, // Wake at 7 AM
    command: `node worker.js wake`,
  };

  // Schedule jobs using Heroku Scheduler
  await client.scheduler.schedule(sleepJob);
  await client.scheduler.schedule(wakeJob);

  // Remove setTimeout code for scheduling, as it's not reliable in Heroku
}

// Handle process termination signals for graceful shutdown
process.on('SIGINT', async () => {
  await client.destroy();
});

process.on('SIGTERM', async () => {
  await client.destroy();
});

// Worker.js file
const { Client, GatewayIntentBits, Collection, ActivityType } = require('discord.js');

// Define sleep and wake functions
const sleep = async () => {
  // Put your bot to sleep here (e.g., disable message processing)
  console.log("Bot is now sleeping...");

  // Gracefully disconnect the bot from Discord
  await client.destroy();
};

const wake = async () => {
  // Wake your bot up here (e.g., enable message processing)
  console.log("Bot is now awake!");

  // Restart the bot client
  await client.login(process.env.TOKEN);
};

// Export the sleep and wake functions
module.exports = { sleep, wake };
