import { Command, CommandName } from '../Command';
import { ChatInputCommandInteraction } from 'discord.js';
import { generateGameEmbeds } from '../utils/gameUtils';
import { GenreModel } from '../configuration/models/genre.model';
import { Op } from 'sequelize';
import { pagination, PaginationOptions } from '@devraelfreeze/discordjs-pagination';
import { findGamesByGenre } from '../services/gameService';

const options: Command['options'] = [
  {
    type: 3,
    name: 'genre',
    description: 'Filter games on a specific genre.',
    required: false,
    autocomplete: true,
  },
];

const generatePaginationOptions = async (
  interaction: ChatInputCommandInteraction,
): Promise<PaginationOptions> => {
  const genre = interaction.options.get('genre')?.value;
  const games = await findGamesByGenre(genre);
  const embeds = generateGameEmbeds(games).map((builder) => builder.toJSON());
  return {
    ephemeral: true,
    embeds,
    interaction,
    author: interaction.user,
  };
};

const run: Command['run'] = async (interaction) => {
  // Initial answer (to prevent timeout)
  await interaction.deferReply();

  const paginationOptions = await generatePaginationOptions(interaction);
  await pagination(paginationOptions);
};

const autocomplete: Command['autocomplete'] = async (interaction) => {
  const focussedValue = interaction.options.getFocused();
  const genres = await GenreModel.findAll({
    where: {
      [Op.or]: [
        { description: { [Op.iLike]: `${focussedValue}%` } },
        { description: { [Op.iLike]: `%${focussedValue}%` } },
      ],
    },
  });
  const autocompleteOptions = genres.slice(0, 20).map(({ description }) => ({
    name: description,
    value: description,
  }));
  await interaction.respond(autocompleteOptions);
};

export const listGames: Command = {
  name: CommandName.ListGames,
  description: 'List all the coveted games.',
  options,
  autocomplete,
  run,
};
