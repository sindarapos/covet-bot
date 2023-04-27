import { Command, CommandName } from '../Command';
import { summaryFormatter } from '../utils/stringUtils';
import Fuse from 'fuse.js';

interface App {
  id: number;
  name: string;
}

const querySteamApps = (apps: App[], query: string): App[] => {
  const fuse = new Fuse(apps, { keys: ['name'], shouldSort: true, findAllMatches: true, threshold: 0.1 });
  return fuse.search(query)?.map((fuseResult) => fuseResult.item);
};

const fetchSteamApps = async (): Promise<App[]> => {
  try {
    const response = await fetch(
      'https://api.steampowered.com/ISteamApps/GetAppList/v0002/?format=json',
    );
    const data = await response.json();
    return data?.applist?.apps ?? [];
  }
  catch (e) {
    throw new Error(`I was unable to contact steam: ${e}`);
  }
};

const generateContent = (apps: App[], query: string): string => {
  // no game found
  if (apps?.length === 0) {
    return `Sorry, I wasn't able to find "${query}" in the Steam store :sweat:.`;
  }

  // single game found
  if (apps?.length === 1) {
    return `I've found ${apps[0]?.name} in the steam store!`;
  }

  // multiple games found
  const appNames = apps.map((app) => app.name);
  const summary = summaryFormatter(appNames);
  return `I've found ${summary} games that match your query, which one are you looking for?`;
};

const findSteamApps = async (query: string): Promise<App[]> => {
  const apps = await fetchSteamApps();
  return querySteamApps(apps, query);
};

const options: Command['options'] = [{
  type: 3,
  name: 'query',
  description: 'The name of the game you are trying to find.',
  required: true,
}];

const findGame: Command = {
  name: CommandName.FindGame,
  description: 'Finds a game in the steam store.',
  options,
  run: async (interaction) => {
    const query = interaction.options.get('query')?.value;

    // Initial answer (to prevent timeout)
    await interaction.reply({
      ephemeral: true,
      content: `Looking for "${query}" in the Steam store ...`,
    });

    if (typeof query !== 'string') {
      return;
    }

    try {
      const apps = await findSteamApps(query);
      const content = generateContent(apps, query);

      await interaction.followUp({
        ephemeral: true,
        content,
      });
    }
    catch (e) {
      await interaction.followUp({
        ephemeral: true,
        content: `Ran into an error: ${e}`,
      });
    }
  },
};

export default findGame;
