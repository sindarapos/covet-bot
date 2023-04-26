import { Client, ClientApplication } from 'discord.js';
import { Commands } from '../Command';

export default (client: Client): void => {
  client.on('ready', async () => {
    if (
      !client.user ||
      !client.application ||
      !(client.application instanceof ClientApplication)
    ) {
      return;
    }

    console.log('Registering commands ...');
    await client.application.commands.set(Commands);

    console.log(`${client.user?.username} is online`);
  });
};
