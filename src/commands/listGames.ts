import { Command, CommandName } from '../Command';
import { GameModel } from '../configuration/models/game.model';
import { ChatInputCommandInteraction } from 'discord.js';
import { generateChatInputApplicationMention } from '../utils/stringUtils';
import { generateGameList } from '../utils/gameUtils';
import { GenreModel } from '../configuration/models/genre.model';
import { Includeable, Op } from 'sequelize';

const options: Command['options'] = [
  {
    type: 3,
    name: 'genre',
    description: 'Filter games on a specific genre.',
    required: false,
    autocomplete: true,
  },
];

const generateContent = async (
  interaction: ChatInputCommandInteraction,
): Promise<string> => {
  const gameCount = await GameModel.count();
  const covetCommandMention = await generateChatInputApplicationMention(
    interaction,
    CommandName.AddGame,
  );

  // no game found
  if (gameCount === 0) {
    return `It seems nobody has added any games yet :sweat_smile:. Try adding a game using the ${covetCommandMention} command.`;
  }

  const genre = interaction.options.get('genre')?.value;
  const genresFilterInclude: Includeable[] = genre
    ? [
        {
          model: GenreModel,
          where: { description: genre },
          as: 'genresFilter',
        },
      ]
    : [];

  // multiple games found
  const games = await GameModel.findAll({
    order: [['releaseDate', 'DESC']],
    include: ['genres', 'owners', 'categories', ...genresFilterInclude],
  });

  return `I've found ${games.length} games that have been coveted:\n\r${generateGameList(
    games,
  )}`;
};

const run: Command['run'] = async (interaction) => {
  // Initial answer (to prevent timeout)
  await interaction.reply({
    ephemeral: true,
    content: 'Fetching the game list ...',
  });

  try {
    const content = await generateContent(interaction);
    await interaction.editReply({
      content,
    });
  } catch (e: unknown) {
    await interaction.followUp({
      ephemeral: true,
      content: `Ran into an error: ${e}`,
    });
  }
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
