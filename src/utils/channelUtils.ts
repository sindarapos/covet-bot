import { Channel, Client, TextBasedChannel } from 'discord.js';

export const channelIdsByName = async (
  client: Client,
  channelName = 'game-announcements',
) => {
  const oAuth2Guilds = await client.guilds.fetch();
  const guilds = await Promise.all(
    oAuth2Guilds.map(async (oAuth2Guild) => oAuth2Guild.fetch()),
  );
  const guildChannels = await Promise.all(guilds.map(({ channels }) => channels.fetch()));

  return guildChannels
    .map((guildChannels) => {
      const guildChannel = guildChannels.find(
        (channel) => channel?.name.toLowerCase() === channelName,
      );
      return guildChannel?.id;
    })
    .filter((id): id is string => !!id);
};

export const channelsByName = async (
  client: Client,
  channelName = 'game-announcements',
) => {
  const announcementChannelIds = await channelIdsByName(client, channelName);
  const announcementChannels = await Promise.all(
    announcementChannelIds.map(async (id) => {
      return await client.channels.fetch(id);
    }, []),
  );
  return announcementChannels
    .filter((channel): channel is Channel => !!channel)
    .filter((channel): channel is TextBasedChannel => channel.isTextBased());
};
