import { Command, CommandName } from '../Command';
import { findGame } from './findGame';
import {
  bold,
  ButtonInteraction,
  ChatInputCommandInteraction,
  InteractionResponse,
  italic,
  Message,
} from 'discord.js';
import { SteamAppDetail } from '../SteamAppDetail.ts';
import { GameModel } from '../configuration/models/game.model.ts';
import { GenreModel } from '../configuration/models/genre.model.ts';
import { UserModel } from '../configuration/models/user.model.ts';
import { ButtonCustomIds, findAndDisplaySteamAppDetails } from '../utils/gameUtils.ts';

const options: Command['options'] = [
  {
    type: 3,
    name: 'game',
    description: 'The name of the game want to add.',
    required: true,
    autocomplete: true,
  },
];

const generateResponseCollector = async (
  message: Message,
  interaction: ChatInputCommandInteraction,
): Promise<ButtonInteraction> => {
  return await message.awaitMessageComponent<2>({
    filter: (i) => i.user.id === interaction.user.id,
    time: 300000,
  });
};

const handleCancel = async (
  interaction: ButtonInteraction,
  details: SteamAppDetail,
): Promise<InteractionResponse> =>
  interaction.update({
    content: `Cancelling... the game ${bold(details.name)} has ${italic(
      'not',
    )} been added.`,
    embeds: [],
    components: [],
  });

const handleEdit = async (interaction: ButtonInteraction): Promise<InteractionResponse> =>
  interaction.update({
    content: `Sorry :cry:! This feature is not yet implemented.`,
    embeds: [],
    components: [],
  });

const handleConfirm = async (
  interaction: ButtonInteraction,
  details: SteamAppDetail,
): Promise<InteractionResponse> => {
  // upsert genres
  const genres = await GenreModel.bulkCreate(details.genres, {
    fields: ['description'],
    ignoreDuplicates: true,
  });

  // upsert user
  const [user] = await UserModel.upsert({
    discordUserId: interaction.user.id,
    username: interaction.user.username,
  });

  // create a new game
  const [game] = await GameModel.upsert({
    name: details.name,
    description: details.shortDescription,
    image: details.headerImage,
    releaseDate: new Date(details.releaseDate.date),
  });

  // set associations
  game.genres = genres;
  game.owners = [user];
  await game.save();

  return interaction.update({
    content: `Great :thumbsup:! The game ${bold(details.name)} has been added!`,
    embeds: [],
    components: [],
  });
};

const handleInteractionResponse = async (
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
  interaction.ephemeral = true;

  // Initial answer (to prevent timeout)
  await interaction.reply({
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
    await handleInteractionResponse(interaction, message, details);
  } catch (e: unknown) {
    await interaction.followUp({
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
