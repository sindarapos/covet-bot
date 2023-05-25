import { Command, CommandName } from '../Command';
import {
  ActionRowBuilder,
  bold,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  InteractionEditReplyOptions,
} from 'discord.js';
import {
  autocompleteGames,
  ButtonCustomIds,
  generateEmptyGameListContent,
  generateGameEmbeds,
} from '../utils/gameUtils';
import {
  destroyGameByName,
  findGameByName,
  isEmptyGameList,
} from '../services/gameService';
import { MessageActionRowComponentBuilder } from '@discordjs/builders';
import { generateInitiatorMessageComponentCollector } from '../utils/commandUtils';

const options: Command['options'] = [
  {
    type: 3,
    name: 'name',
    description: 'Select a game based on a specific name.',
    required: true,
    autocomplete: true,
  },
];

const generateContent = (): string => {
  return `Are you sure you want to remove this game?\n\r:warning: This will remove the game for everyone on the server!`;
};

const generateGameDeleteActionRow =
  (): ActionRowBuilder<MessageActionRowComponentBuilder> => {
    const cancel = new ButtonBuilder()
      .setCustomId(ButtonCustomIds.cancel)
      .setLabel('Cancel')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('✖️');

    const remove = new ButtonBuilder()
      .setCustomId(ButtonCustomIds.delete)
      .setLabel('Remove')
      .setStyle(ButtonStyle.Danger)
      .setEmoji('🔥');

    return new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
      cancel,
      remove,
    );
  };

const generateReply = async (
  interaction: ChatInputCommandInteraction,
): Promise<InteractionEditReplyOptions> => {
  const name = interaction.options.get('name')?.value ?? 'unknown';
  const game = await findGameByName(name.toString());

  if (!game) {
    return {
      content: `The game ${bold(name.toString())} has not yet been coveted!`,
      embeds: [],
      components: [],
    };
  }

  const content = generateContent();
  const embeds = generateGameEmbeds([game]);
  const components: InteractionEditReplyOptions['components'] = [
    generateGameDeleteActionRow(),
  ];
  return {
    content,
    embeds,
    components,
  };
};

const run: Command['run'] = async (interaction) => {
  // Initial answer (to prevent timeout)
  if (!interaction.replied) {
    await interaction.reply({
      ephemeral: true,
      content: 'Fetching the game list ...',
    });
  }

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

  switch (buttonInteraction.customId) {
    case ButtonCustomIds.cancel:
      await buttonInteraction.update({
        content: `Ok, nothing has been removed.`,
        components: [],
        embeds: [],
      });
      break;
    default:
    case ButtonCustomIds.delete: {
      const name = interaction.options.get('name')?.value?.toString() ?? 'unknown';
      await destroyGameByName(name);
      await buttonInteraction.update({
        content: `The game ${name} has been removed.`,
        components: [],
        embeds: [],
      });
      break;
    }
  }
};

export const deleteGame: Command = {
  name: CommandName.DeleteGame,
  description: 'Remove a coveted game.',
  options,
  autocomplete: autocompleteGames,
  run,
};
