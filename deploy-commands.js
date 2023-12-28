require('dotenv').config();

const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

const clientId = process.env.CLIENT_ID;
const token = process.env.TOKEN;

const commands = [];

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);

		if ('data' in command && 'execute' in command) {
			commands.push(command.data.toJSON());
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const rest = new REST().setToken(token);

(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// Ambil list guilds/bot berada
		const guilds = await rest.get(
			Routes.applicationGuilds(clientId)
		);

		// Loop untuk setiap guild
		for (const guild of guilds) {
			await rest.put(
				Routes.applicationGuildCommands(clientId, guild.id),
				{ body: commands },
			);
			console.log(`Successfully reloaded application (/) commands for guild ${guild.id}.`);
		}

		console.log('All guilds have been updated.');

	} catch (error) {
		console.error(error);
	}
})();
