import { Client, ClientApplication, ClientUser, Events } from 'discord.js';
import { commands } from '../Command';
import { initModels, sequelize } from '../configuration/database';
import { GameModel } from '../configuration/models/game.model';
import { UserModel } from '../configuration/models/user.model';
import moment from 'moment';
import { findRandomGame } from '../services/gameService';
import { generateGameEmbeds } from '../utils/gameUtils';
import { channelsByName } from '../utils/channelUtils';

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

const dailyTriggerMoment = (time: string, format = 'HH:mm') => {
  const now = moment();
  const triggerMoment = moment(time, format);
  if (triggerMoment.isBefore(now)) {
    triggerMoment.add(1, 'day');
  }
  const duration = triggerMoment.diff(now);
  return { triggerMoment, duration };
};

const initNotificationPolling = async (client: Client) => {
  // find time until next message
  const { triggerMoment, duration } = dailyTriggerMoment('9:50');
  console.log('Setting notification to trigger in', triggerMoment.fromNow());

  // fetch all channels that should receive game announcements
  const announcementChannels = await channelsByName(client);

  console.log(
    'list of channels that should receive an announcement',
    announcementChannels,
  );

  // set up the timer
  setTimeout(async () => {
    if (announcementChannels.length === 0) {
      return initNotificationPolling(client);
    }

    // send a random game
    const game = await findRandomGame();
    const embeds = generateGameEmbeds([game]);

    await Promise.all(
      announcementChannels.map(async ({ send }) => {
        return send({
          content: 'A random game for you today!',
          embeds,
        });
      }),
    );

    // set the timer again
    await initNotificationPolling(client);
  }, duration);
};

export const ready = (client: Client) => {
  client.on(Events.ClientReady, async () => {
    await checkDatabaseConnection();
    await syncDatabaseModels();
    await initCommands(client);
    await initNotificationPolling(client);
  });
};
