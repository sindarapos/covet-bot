import { Command, CommandName } from '../Command';
import { findSteamAppDetails } from '../utils/steamUtils';
import { findGame } from './findGame';
import { SteamAppDetail } from '../SteamAppDetail';
import { EmbedBuilder } from 'discord.js';

const options: Command['options'] = [
  {
    type: 3,
    name: 'game',
    description: 'The name of the game want to add.',
    required: true,
    autocomplete: true,
  },
];

const generateSteamAppEmbed = ({
  name,
  shortDescription,
  headerImage,
  genres,
  releaseDate: { date, comingSoon },
  priceOverview: { finalFormatted },
  website,
}: SteamAppDetail): EmbedBuilder => {
  const genresMessage = genres.map(({ description }) => description).join(', ');
  return new EmbedBuilder()
    .setTitle(name)
    .setDescription(shortDescription)
    .setImage(headerImage)
    .setFields(
      { name: 'Genres', value: genresMessage },
      { name: 'Release date', value: comingSoon ? 'coming soon' : date, inline: true },
      { name: 'Price', value: finalFormatted, inline: true },
    )
    .setURL(website);
};

const run: Command['run'] = async (interaction) => {
  const query = interaction.options.get('game')?.value;

  // Initial answer (to prevent timeout)
  await interaction.reply({
    ephemeral: true,
    content: `Looking for "${query ?? 'unknown'}" in the Steam store ...`,
  });

  if (typeof query !== 'string') {
    return;
  }

  try {
    const details = await findSteamAppDetails(query);

    if (!details) {
      await interaction.editReply({
        content: `Sorry, I wasn't able to find "${query}" in the Steam store :sweat:.`,
      });
      return;
    }

    const embed = generateSteamAppEmbed(details);
    await interaction.editReply({
      embeds: [embed],
    });
  } catch (e: unknown) {
    await interaction.followUp({
      ephemeral: true,
      content: `Ran into an error: ${e}`,
    });
  }
};

export const addGame: Command = {
  name: CommandName.AddGame,
  description: 'Adds a new game.',
  options,
  autocomplete: findGame.autocomplete,
  run,
};
