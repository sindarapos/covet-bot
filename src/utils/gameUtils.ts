import {
  ActionRowBuilder,
  bold,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  Message,
} from 'discord.js';
import { SteamAppDetail } from '../SteamAppDetail';
import { findSteamAppDetails } from '../services/steamService';
import { generateSteamAppEmbed } from './steamUtils';
import { MessageActionRowComponentBuilder } from '@discordjs/builders';
import { GameModel } from '../configuration/models/game.model';
import { CategoryModel } from '../configuration/models/category.model';
import moment from 'moment/moment';

export const enum ButtonCustomIds {
  confirm = 'confirm',
  edit = 'edit',
  cancel = 'cancel',
}

const generateActionRow = (): ActionRowBuilder<MessageActionRowComponentBuilder> => {
  const confirm = new ButtonBuilder()
    .setCustomId(ButtonCustomIds.confirm)
    .setLabel('Add')
    .setStyle(ButtonStyle.Success);

  const edit = new ButtonBuilder()
    .setCustomId(ButtonCustomIds.edit)
    .setLabel('Edit')
    .setStyle(ButtonStyle.Primary);

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

export const findAndDisplaySteamAppDetails = async (
  interaction: ChatInputCommandInteraction,
  query: string,
  content = "Is this the game you'd like to add?",
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
    content,
    embeds: [embed],
    components: [row],
  });
  return [details, message];
};
const generateGameCategoryIcons = (categories?: CategoryModel[]): string => {
  const isMultiplayer = categories?.some(
    ({ description }) => description === 'Multi-player',
  );
  const isCoop = categories?.some(({ description }) => description === 'Co-op');
  const isPvP = categories?.some(({ description }) => description === 'PvP');
  const multiplayerIcon = isMultiplayer ? ':family:' : '';
  const coopIcon = isCoop ? ':two_hearts:' : '';
  const pvpIcon = isPvP ? ':crossed_swords:' : '';

  return `${multiplayerIcon} ${coopIcon} ${pvpIcon}`;
};
const generateGameListItem = ({
  name,
  releaseDate,
  owners,
  genres,
  categories,
}: GameModel): string => {
  const releaseDateMoment = moment(releaseDate);
  const isPastRelease = releaseDateMoment.isBefore(moment());
  const fromNow = releaseDateMoment.fromNow();
  const username = owners?.[0]?.username ?? 'nobody';
  const genreSummary = genres?.map(({ description }) => description)?.join(', ') ?? '';
  const categoryIcons = generateGameCategoryIcons(categories);
  return `${bold(name)} ${categoryIcons}\n${genreSummary}\nRelease${
    isPastRelease ? 'd' : 's'
  } ${fromNow} · Added by ${username}`;
};
export const generateGameList = (games: GameModel[]): string => {
  return games.map(generateGameListItem).join('\n\r');
};
