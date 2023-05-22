import { Command, CommandName } from '../Command';
import { GameModel } from '../configuration/models/game.model';
import { ChatInputCommandInteraction } from 'discord.js';
import { generateChatInputApplicationMention } from '../utils/stringUtils';
import { generateGameList } from '../utils/gameUtils';

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

  // multiple games found
  const games = await GameModel.findAll({
    order: [['releaseDate', 'DESC']],
    include: { all: true, nested: true },
  });

  return `I've found ${gameCount} games that have been coveted:\n\r${generateGameList(
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

export const listGames: Command = {
  name: CommandName.ListGames,
  description: 'List all the coveted games.',
  run,
};
