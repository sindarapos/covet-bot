import 'dotenv/config';
import { Client } from 'discord.js';
import { ready } from './listeners/ready';
import { interactionCreate } from './listeners/interactionCreate';

console.log('Bot is starting ...');
const client = new Client({
  intents: [],
});

console.log('Logging in ...');
client.login(process.env.DISCORD_TOKEN);

console.log('Registering listeners ...');
ready(client);
interactionCreate(client);
