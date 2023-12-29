client.once('ready', async () => {
  console.log(`Your bot is Launch ${client.user.tag}`);
  updateStatus();
  setInterval(() => {
    updateStatus();
  }, 3600000);

  // Pendaftaran perintah global
  const slashCommands = [
    { name: 'ping', description: 'Ping command' },
  ];

  // Filter perintah yang sudah terdaftar
  const existingCommands = await client.application.commands.fetch();
  const newCommands = slashCommands.filter(cmd => !existingCommands.has(cmd.name));

  // Register hanya perintah yang belum terdaftar
  client.application.commands.set(newCommands);

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

  // ... (rest of the code)

});
