import { Client, ClientApplication, ClientUser } from 'discord.js';
import { commands } from '../Command';
import { initModels, sequelize } from '../configuration/database';
import { GameModel } from '../configuration/models/game.model';
import { UserModel } from '../configuration/models/user.model';

const syncDatabaseModels = async () => {
  console.log('Initializing models ...');

  try {
    initModels();
    console.log('Database models has been initialized successfully.');
  } catch (error) {
    console.error('Unable to initialize database models:', error);
  }

  console.log('Syncing database models ...');
  try {
    await sequelize.sync();
    console.log('Database models synced  successfully.');
  } catch (error) {
    console.error('Unable to sync database models:', error);
  }

  const gameCount = await GameModel.count();
  const userCount = await UserModel.count();
  console.log(
    `Currently ${gameCount} games and ${userCount} users are stored in the database.`,
  );
};

const checkDatabaseConnection = async () => {
  console.log('Connecting to database ...');
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

const initCommands = async (client: Client) => {
  if (
    !client.user ||
    !client.application ||
    !(client.application instanceof ClientApplication)
  ) {
    return;
  }

  console.log('Registering commands ...');
  await client.application.commands.set(commands);

  if (client.user instanceof ClientUser) {
    console.log(`${client.user.username} is online`);
  }
};

export const ready = (client: Client) => {
  client.on('ready', async () => {
    await checkDatabaseConnection();
    await syncDatabaseModels();
    await initCommands(client);
  });
};
