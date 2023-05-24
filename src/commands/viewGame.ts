import { Command, CommandName } from '../Command';
import { bold, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { GameModel } from '../configuration/models/game.model';
import { generateGameEmbed, handleEmptyGameCount } from '../utils/gameUtils';
import { Op } from 'sequelize';

const options: Command['options'] = [
  {
    type: 3,
    name: 'name',
    description: 'Select a game based on a specific name.',
    required: true,
    autocomplete: true,
  },
];

const generateGameContent = async (
  interaction: ChatInputCommandInteraction,
): Promise<[string] | [string, EmbedBuilder[]]> => {
  const name = interaction.options.get('name')?.value ?? 'unknown';
  const game = await GameModel.findOne({
    where: { name },
    include: { all: true, nested: true },
  });

  if (!game) {
    return [`The game ${bold(name.toString())} has not yet been coveted!`];
  }

  return ['Here you go! \n\r ', [generateGameEmbed(game)]];
};

const generateContent = async (
  interaction: ChatInputCommandInteraction,
): ReturnType<typeof generateGameContent> => {
  const result = await handleEmptyGameCount(interaction, () =>
    generateGameContent(interaction),
  );
  if (Array.isArray(result)) {
    return result;
  }
  return [result];
};

const run: Command['run'] = async (interaction) => {
  // Initial answer (to prevent timeout)
  await interaction.reply({
    ephemeral: true,
    content: 'Fetching the game list ...',
  });

  const [content, embeds = []] = await generateContent(interaction);
  await interaction.editReply({
    content,
    embeds,
  });
};

const autocomplete: Command['autocomplete'] = async (interaction) => {
  const focussedValue = interaction.options.getFocused();
  const games = await GameModel.findAll({
    where: {
      [Op.or]: [
        { name: { [Op.iLike]: `${focussedValue}%` } },
        { name: { [Op.iLike]: `%${focussedValue}%` } },
      ],
    },
    include: { all: true, nested: true },
  });

  const autocompleteOptions = games.slice(0, 20).map(({ name }) => {
    return {
      name: name,
      value: name,
    };
  });
  await interaction.respond(autocompleteOptions);
};

export const viewGame: Command = {
  name: CommandName.ViewGame,
  description: 'View a specific coveted game.',
  options,
  autocomplete,
  run,
};
