import { Channel, Client, TextBasedChannel } from 'discord.js';

export async function channelsByName(client: Client, channelName = 'game-announcements') {
  const oAuth2Guilds = await client.guilds.fetch();
  const guilds = await Promise.all(
    oAuth2Guilds.map(async (oAuth2Guild) => oAuth2Guild.fetch()),
  );
  const guildChannels = await Promise.all(guilds.map(({ channels }) => channels.fetch()));

  const announcementChannelIds = guildChannels
    .map((guildChannels) => {
      const guildChannel = guildChannels.find(
        (channel) => channel?.name.toLowerCase() === channelName,
      );
      return guildChannel?.id;
    })
    .filter((id): id is string => !!id);

  const announcementChannels = await Promise.all(
    announcementChannelIds.map(async (id) => {
      return await client.channels.fetch(id);
    }, []),
  );
  return announcementChannels
    .filter((channel): channel is Channel => !!channel)
    .filter((channel): channel is TextBasedChannel => channel.isTextBased());
}
