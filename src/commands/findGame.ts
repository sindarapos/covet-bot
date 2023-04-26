import { Command, CommandName } from '../Command';
import { fuzzyMatch } from '../utils/stringUtils';

interface App {
  id: number;
  name: string;
}

const fetchSteamApps = async (query: string): Promise<App[]> => {
  try {
    const response = await fetch(
      'https://api.steampowered.com/ISteamApps/GetAppList/v0002/?format=json',
    );
    const data = await response.json();
    const apps: App[] = data?.applist?.apps;
    console.log('return from steam', apps);
    if (!Array.isArray(apps)) {
      return [];
    }
    return apps?.filter((app) => fuzzyMatch(query, app.name));
  }
  catch (e) {
    throw new Error(`I was unable to contact steam: ${e}`);
  }
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
    console.log('Looking for game with query', query);

    if (typeof query !== 'string') {
      return;
    }

    try {
      const apps = await fetchSteamApps(query);

      // no game found
      if (apps?.length === 0) {
        await interaction.reply({
          ephemeral: true,
          content: `Sorry, I wasn't able to find "${query}" in the Steam store :sweat:.`,
        });
        return;
      }

      // single game found
      if (apps?.length === 1) {
        await interaction.reply({
          ephemeral: true,
          content: `I've found ${apps[0]?.name} in the steam store!`,
        });
        return;
      }

      // multiple games found
      const appNames = apps.map((app) => app?.name).join(', ');
      await interaction.reply({
        ephemeral: true,
        content: `I've found ${apps.length} games that match your query, which one are you looking for? ${appNames}`,
      });
    }
    catch (e) {
      await interaction.reply({
        ephemeral: true,
        content: `Ran into an error: ${e}`,
      });
    }
  },
};

export default findGame;
