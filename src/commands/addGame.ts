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
import { ButtonCustomIds } from '../utils/gameUtils';
import { GenreModel } from '../configuration/models/genre.model';
import { CategoryModel } from '../configuration/models/category.model';
import { findAndDisplaySteamAppDetails } from '../utils/steamUtils';
import { generateInitiatorMessageComponentCollector } from '../utils/commandUtils';

const options: Command['options'] = [
  {
    type: 3,
    name: 'game',
    description: 'The name of the game want to add.',
    required: true,
    autocomplete: true,
  },
];

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
    categories: steamAppCategories,
    genres: steamAppGenres,
    headerImage,
    name,
    releaseDate: { date },
    shortDescription,
    steamAppid,
    priceOverview,
  }: SteamAppDetail,
): Promise<InteractionResponse> => {
  // upsert user
  const [user] = await UserModel.upsert({
    discordUserId: interaction.user.id,
    username: interaction.user.username,
  });

  // create a new game
  const price = priceOverview?.final ? priceOverview.final / 100 : undefined;
  const [game] = await GameModel.upsert({
    name,
    description: shortDescription,
    image: headerImage,
    releaseDate: new Date(date),
    steamAppid,
    price,
  });

  // define associations
  const genres = (
    await Promise.all(
      steamAppGenres.map(({ description }) => GenreModel.upsert({ description })),
    )
  ).map(([genre]) => genre);
  const categories = (
    await Promise.all(
      steamAppCategories.map(({ description }) => CategoryModel.upsert({ description })),
    )
  ).map(([category]) => category);

  // set associations
  await game.$set('categories', categories);
  await game.$set('genres', genres);
  await game.$set('owners', [user]);
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
  const confirm = await generateInitiatorMessageComponentCollector(message, interaction);
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

  const [details, message] = await findAndDisplaySteamAppDetails(interaction, query);
  if (!details) {
    return;
  }
  await handleInteractionResponse(interaction, message, details);
};

export const addGame: Command = {
  name: CommandName.AddGame,
  description: 'Adds a new game.',
  options,
  autocomplete: findGame.autocomplete,
  run,
};
