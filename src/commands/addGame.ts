import { Command, CommandName } from '../Command';
import { findGame } from './findGame';
import {
  ActionRowBuilder,
  bold,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
  InteractionResponse,
  italic,
  Message,
} from 'discord.js';
import { MessageActionRowComponentBuilder } from '@discordjs/builders';
import { findSteamAppDetails } from '../services/steamService.ts';
import { SteamAppDetail } from '../SteamAppDetail.ts';
import { generateSteamAppEmbed } from '../utils/steamUtils.ts';

const enum ButtonCustomIds {
  confirm = 'confirm',
  edit = 'edit',
  cancel = 'cancel',
}

const options: Command['options'] = [
  {
    type: 3,
    name: 'game',
    description: 'The name of the game want to add.',
    required: true,
    autocomplete: true,
  },
];

const generateActionRow = (): ActionRowBuilder<MessageActionRowComponentBuilder> => {
  const confirm = new ButtonBuilder()
    .setCustomId(ButtonCustomIds.confirm)
    .setLabel('Add')
    .setStyle(ButtonStyle.Primary);

  const edit = new ButtonBuilder()
    .setCustomId(ButtonCustomIds.edit)
    .setLabel('Edit')
    .setStyle(ButtonStyle.Secondary);

  const cancel = new ButtonBuilder()
    .setCustomId(ButtonCustomIds.cancel)
    .setLabel('Cancel')
    .setStyle(ButtonStyle.Secondary);

  return new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
    cancel,
    edit,
    confirm,
  );
};

const generateResponseCollector = async (
  message: Message,
  interaction: ChatInputCommandInteraction,
): Promise<ButtonInteraction> => {
  return await message.awaitMessageComponent<2>({
    filter: (i) => i.user.id === interaction.user.id,
    time: 300000,
  });
};

const findAndDisplaySteamAppDetails = async (
  interaction: ChatInputCommandInteraction,
  query: string,
): Promise<[SteamAppDetail | undefined, Message]> => {
  const details = await findSteamAppDetails(query);

  if (!details) {
    const message = await interaction.editReply({
      content: `Sorry, I wasn't able to find "${query}" in the Steam store :sweat:.`,
    });
    return [details, message];
  }

  const embed = generateSteamAppEmbed(details);
  const row = generateActionRow();
  const message = await interaction.editReply({
    content: "Is this the game you'd like to add?",
    embeds: [embed],
    components: [row],
  });
  return [details, message];
};

const handleCancel = async (
  buttonInteraction: ButtonInteraction,
  details: SteamAppDetail,
): Promise<InteractionResponse> =>
  buttonInteraction.update({
    content: `Cancelling... the game ${bold(details.name)} has ${italic(
      'not',
    )} been added.`,
    embeds: [],
    components: [],
  });

const handleEdit = async (
  buttonInteraction: ButtonInteraction,
): Promise<InteractionResponse> =>
  buttonInteraction.update({
    content: `Sorry :cry:! This feature is not yet implemented.`,
    embeds: [],
    components: [],
  });

const handleConfirm = async (
  buttonInteraction: ButtonInteraction,
  details: SteamAppDetail,
): Promise<InteractionResponse> =>
  buttonInteraction.update({
    content: `Great :thumbsup:! The game ${bold(details.name)} has been added!`,
    embeds: [],
    components: [],
  });

const handleConfirmation = async (
  interaction: ChatInputCommandInteraction,
  message: Message,
  details: SteamAppDetail,
): Promise<InteractionResponse> => {
  const confirm = await generateResponseCollector(message, interaction);
  switch (confirm.customId) {
    case ButtonCustomIds.confirm:
      return handleConfirm(confirm, details);
    case ButtonCustomIds.edit:
      return handleEdit(confirm);
    default:
    case ButtonCustomIds.cancel:
      return handleCancel(confirm, details);
  }
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
    const [details, message] = await findAndDisplaySteamAppDetails(interaction, query);
    if (!details) {
      return;
    }
    await handleConfirmation(interaction, message, details);
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
