import { Command, CommandName } from '../Command';
import {
  ActionRowBuilder,
  bold,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  InteractionEditReplyOptions,
  userMention,
} from 'discord.js';
import { GameModel } from '../configuration/models/game.model';
import {
  autocompleteGames,
  ButtonCustomIds,
  generateEmptyGameListContent,
  generateGameEmbeds,
} from '../utils/gameUtils';
import { isEmptyGameList } from '../services/gameService';
import { MessageActionRowComponentBuilder } from '@discordjs/builders';
import { generateInitiatorMessageComponentCollector } from '../utils/commandUtils';
import { deleteGame } from './deleteGame';

const options: Command['options'] = [
  {
    type: 3,
    name: 'name',
    description: 'Select a game based on a specific name.',
    required: true,
    autocomplete: true,
  },
];

const generateContent = (game: GameModel | undefined | null, query: string): string => {
  if (!game) {
    `The game ${bold(query)} has not yet been coveted!`;
  }

  return 'There you go!';
};

const generateGameViewActionRow =
  (): ActionRowBuilder<MessageActionRowComponentBuilder> => {
    const share = new ButtonBuilder()
      .setCustomId(ButtonCustomIds.share)
      .setLabel('Broadcast')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('📢');

    const edit = new ButtonBuilder()
      .setCustomId(ButtonCustomIds.edit)
      .setLabel('Edit')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('📝');

    const remove = new ButtonBuilder()
      .setCustomId(ButtonCustomIds.delete)
      .setLabel('Remove')
      .setStyle(ButtonStyle.Danger)
      .setEmoji('🔥');

    return new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
      remove,
      edit,
      share,
    );
  };

const generateReply = async (
  interaction: ChatInputCommandInteraction,
): Promise<InteractionEditReplyOptions> => {
  const name = interaction.options.get('name')?.value ?? 'unknown';
  const game = await GameModel.findOne({
    where: { name },
    include: { all: true, nested: true },
  });

  const content = generateContent(game, name.toString());
  const embeds = generateGameEmbeds([game]);
  const components: InteractionEditReplyOptions['components'] = [
    generateGameViewActionRow(),
  ];
  return {
    content,
    embeds,
    components,
  };
};

const run: Command['run'] = async (interaction) => {
  // Initial answer (to prevent timeout)
  await interaction.reply({
    ephemeral: true,
    content: 'Fetching the game list ...',
  });

  if (await isEmptyGameList()) {
    await interaction.editReply(await generateEmptyGameListContent(interaction));
    return;
  }

  const reply = await generateReply(interaction);
  const message = await interaction.editReply(reply);

  const buttonInteraction = await generateInitiatorMessageComponentCollector(
    message,
    interaction,
  );

  switch (buttonInteraction?.customId) {
    case ButtonCustomIds.share:
      await interaction.deleteReply(message);
      await buttonInteraction.reply({
        ...reply,
        content: `Hey everyone, ${userMention(
          interaction.user.id,
        )} wants to let you know about:`,
        components: [],
      });
      break;
    case ButtonCustomIds.edit:
      await buttonInteraction.update({
        content: 'Sorry :cry:! This feature is not yet implemented.',
        components: [],
        embeds: [],
      });
      break;
    case ButtonCustomIds.delete:
      await buttonInteraction.update({});
      await deleteGame.run(interaction);
      break;
  }
};

export const viewGame: Command = {
  name: CommandName.ViewGame,
  description: 'View a specific coveted game.',
  options,
  autocomplete: autocompleteGames,
  run,
};
