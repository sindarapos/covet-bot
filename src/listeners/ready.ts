import {
  Client,
  ClientApplication,
  ClientUser,
  Events,
  TextBasedChannel,
} from 'discord.js';
import { commands } from '../Command';
import { initModels, sequelize } from '../configuration/database';
import { GameModel } from '../configuration/models/game.model';
import { UserModel } from '../configuration/models/user.model';
import moment from 'moment';
import { findRandomGame } from '../services/gameService';
import { generateGameEmbeds } from '../utils/gameUtils';

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

const initNotificationPolling = async (client: Client) => {
  // find time until next message
  const now = moment();
  const triggerMoment = moment('9:50', 'HH:mm');
  if (triggerMoment.isBefore(now)) {
    triggerMoment.add(1, 'day');
  }
  const duration = triggerMoment.diff(now);

  console.log('Setting notification to trigger in', triggerMoment.fromNow());

  // fetch all channels that should receive game announcements
  const oAuth2Guilds = await client.guilds.fetch();
  const guilds = await Promise.all(
    oAuth2Guilds.map(async (oAuth2Guild) => oAuth2Guild.fetch()),
  );
  const allGuildChannels = await Promise.all(
    guilds.map(({ channels }) => channels.fetch()),
  );
  const announcementChannels = allGuildChannels.reduce<TextBasedChannel[]>(
    (accumulator, channels) => {
      const channel = channels.find(
        (channel) => channel?.name.toLowerCase() === 'game-announcements',
      );
      if (!channel?.isTextBased()) {
        return accumulator;
      }
      accumulator.push(channel);
      return accumulator;
    },
    [],
  );

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
      announcementChannels.map(async ({ id }) => {
        const channel = await client.channels.fetch(id);
        if (!channel?.isTextBased()) {
          return;
        }
        return channel.send({
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
