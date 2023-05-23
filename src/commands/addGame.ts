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
import { SteamAppDetail } from '../SteamAppDetail';
import { GameModel } from '../configuration/models/game.model';
import { UserModel } from '../configuration/models/user.model';
import { ButtonCustomIds, findAndDisplaySteamAppDetails } from '../utils/gameUtils';
import { AssociationCreateOptions } from 'sequelize-typescript/dist/model/model/association/association-create-options';

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
  {
    categories,
    genres,
    headerImage,
    name,
    releaseDate: { date },
    shortDescription,
    steamAppid,
    priceOverview: { final },
  }: SteamAppDetail,
): Promise<InteractionResponse> => {
  // upsert user
  const [user] = await UserModel.upsert({
    discordUserId: interaction.user.id,
    username: interaction.user.username,
  });

  // create a new game
  const [game] = await GameModel.upsert({
    name,
    description: shortDescription,
    image: headerImage,
    releaseDate: new Date(date),
    steamAppid,
    price: final / 100,
  });

  // set associations
  await game.$set('owners', [user]);

  const createOptions: AssociationCreateOptions = {
    ignoreDuplicates: true,
    fields: ['description'],
  };
  for (const genre of genres) {
    await game.$create('genre', genre, createOptions);
  }
  for (const category of categories) {
    await game.$create('category', category, createOptions);
  }
  await game.save();

  return interaction.update({
    content: `Great, ${bold(name)} has been added!`,
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
    await handleInteractionResponse(interaction, message, details);
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
