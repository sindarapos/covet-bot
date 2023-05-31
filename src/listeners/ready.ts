import { Client, ClientApplication, ClientUser, Events } from 'discord.js';
import { commands } from '../Command';
import { initModels, sequelize } from '../configuration/database';
import { GameModel } from '../configuration/models/game.model';
import { UserModel } from '../configuration/models/user.model';
import moment from 'moment';
import { findGamesByReleaseDate } from '../services/gameService';
import { generateGameEmbeds } from '../utils/gameUtils';
import { channelsByName } from '../utils/channelUtils';
import { findSteamApps } from '../services/steamService';

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

const handleGameAnnouncement = (client: Client) => async () => {
  const announce = async () => {
    // fetch all channels that should receive game announcements
    const announcementChannels = await channelsByName(client);

    // send a random game
    const endOfToday = moment().endOf('day').toDate();
    const games = await findGamesByReleaseDate(endOfToday);
    const embeds = generateGameEmbeds(games);

    await Promise.all(
      announcementChannels.map(async (channel) => {
        return channel.send({
          content: 'These games will be released soon:',
          embeds,
        });
      }),
    );
  };

  try {
    await announce();
    initNotificationPolling(client);
  } catch (e) {
    console.log('Something went wrong', e);
  }
};

const initNotificationPolling = (client: Client) => {
  // find time until next message
  const { triggerMoment, duration } = dailyTriggerMoment('09:35');
  console.log('Setting notification to trigger', triggerMoment.fromNow());

  // setup game announcement timer
  setTimeout(handleGameAnnouncement(client), duration);
};

const initFetchingSteamAppList = async () => {
  // setup steam game list fetch timer
  const games = await findSteamApps('');
  console.log('Preloaded', games.length, 'games');
  setTimeout(initFetchingSteamAppList, moment.duration(1, 'hour').asMilliseconds());
};

export const ready = (client: Client) => {
  client.on(Events.ClientReady, async () => {
    await checkDatabaseConnection();
    await syncDatabaseModels();
    await initCommands(client);
    await initFetchingSteamAppList();
    initNotificationPolling(client);
  });
};
