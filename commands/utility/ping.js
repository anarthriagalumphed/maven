// Inside your commands folder or wherever you handle commands
const { SlashCommandBuilder } = require('discord.js');

const pingCommand = new SlashCommandBuilder()
	.setName('ping')
	.setDescription('Replies with Pong!');

module.exports = {
	data: pingCommand,
	async execute(interaction) {
		await interaction.reply('Pong!');
	},
};
