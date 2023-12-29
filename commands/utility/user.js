const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('user')
		.setDescription('Provides information about the user.'),
	async execute(interaction) {
		const user = interaction.user;
		const joinedAt = interaction.member.joinedAt;

		// Mendapatkan nama zona waktu dari objek Date pengguna
		const userTimeZone = user.createdAt.getTimezoneOffset();

		// Membuat objek Date baru dengan nama zona waktu pengguna
		const joinedAtInUserTimeZone = new Date(joinedAt.getTime() - userTimeZone * 60000);

		const formattedDate = joinedAtInUserTimeZone.toLocaleString('en-US', {
			weekday: 'short',
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: 'numeric',
			minute: 'numeric',
			second: 'numeric',
			timeZoneName: 'short',
		});

		await interaction.reply(`This command was run by ${user.username}, who joined on ${formattedDate}.`);
	},
};
