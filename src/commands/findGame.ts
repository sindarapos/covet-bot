import { Command, CommandName } from '../Command';
import { summaryFormatter } from '../utils/stringUtils';
import { findSteamApps } from '../utils/steamUtils';
import { SteamApp } from '../SteamApp';

const generateContent = (apps: SteamApp[], query: string): string => {
  // no game found
  if (apps.length === 0) {
    return `Sorry, I wasn't able to find "${query}" in the Steam store :sweat:.`;
  }

  // single game found
  if (apps.length === 1) {
    return `I've found ${apps[0]?.name} in the steam store!`;
  }

  // multiple games found
  const appNames = apps.map((app) => app.name);
  const summary = summaryFormatter(appNames);
  return `I've found ${summary} games that match your query, which one are you looking for?`;
};

const options: Command['options'] = [
  {
    type: 3,
    name: 'query',
    description: 'The name of the game you are trying to find.',
    required: true,
  },
];

export const findGame: Command = {
  name: CommandName.FindGame,
  description: 'Finds a game in the steam store.',
  options,
  run: async (interaction) => {
    const query = interaction.options.get('query')?.value;

    // Initial answer (to prevent timeout)
    await interaction.reply({
      ephemeral: true,
      content: `Looking for "${query ?? 'unknown'}" in the Steam store ...`,
    });

    if (typeof query !== 'string') {
      return;
    }

    try {
      const apps = await findSteamApps(query);
      const content = generateContent(apps, query);

      await interaction.editReply({
        content,
      });
    } catch (e: unknown) {
      await interaction.followUp({
        ephemeral: true,
        content: `Ran into an error: ${e}`,
      });
    }
  },
};
