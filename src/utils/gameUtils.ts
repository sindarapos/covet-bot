import { ChatInputCommandInteraction, EmbedBuilder, hyperlink } from 'discord.js';
import { isSteamAppDetail, SteamAppDetail } from '../SteamAppDetail';
import { GameModel } from '../configuration/models/game.model';
import { CategoryModel } from '../configuration/models/category.model';
import { hideLinkEmbed } from '@discordjs/formatters';
import { generateChatInputApplicationMention } from './stringUtils';
import { CommandName } from '../Command';
import moment from 'moment';

export const enum ButtonCustomIds {
  confirm = 'confirm',
  edit = 'edit',
  cancel = 'cancel',
}

export const generateGameEmbed = (
  content: GameModel | SteamAppDetail | null | undefined,
): EmbedBuilder | undefined => {
  if (!content) {
    return;
  }
  const { name, steamAppid, genres = [] } = content;

  let description;
  let image;
  let releaseDate;
  let price;
  let owner;
  let icons;

  const genresMessage = genres.map(({ description }) => description).join(', ');

  // deal with fields that do not have the same name
  if (isSteamAppDetail(content)) {
    const {
      shortDescription,
      headerImage,
      releaseDate: { date, comingSoon },
      priceOverview: { finalFormatted },
    } = content;
    description = shortDescription;
    image = headerImage;
    releaseDate = comingSoon ? 'coming soon' : date;
    price = finalFormatted;
    owner = 'Steam';
  } else {
    description = content.description;
    image = content.image;
    releaseDate = content.releaseDate
      ? moment(content.releaseDate).fromNow()
      : 'coming soon';
    price = content.price?.toString() ?? '?';
    owner = content.owners?.[0]?.username ?? 'nobody';
    icons = generateGameCategoryIcons(content.categories);
  }

  return new EmbedBuilder()
    .setTitle(`${name} ${icons}`)
    .setDescription(description)
    .setImage(image ?? null)
    .setFields(
      { name: 'Genres', value: genresMessage },
      { name: 'Release date', value: releaseDate, inline: true },
      { name: 'Price', value: `€${price}`, inline: true },
    )
    .setURL(steamAppid ? generateSteamAppUrl(steamAppid) : null)
    .setFooter({ text: `added by ${owner}` });
};

export const generateGameEmbeds = (
  contents: (GameModel | SteamAppDetail | null | undefined)[],
): EmbedBuilder[] => {
  return contents.reduce<EmbedBuilder[]>((accumulator, content) => {
    const embed = generateGameEmbed(content);
    if (!embed) {
      return accumulator;
    }
    return [...accumulator, embed];
  }, []);
};

export const generateSteamAppUrl = (
  steamAppid: NonNullable<GameModel['steamAppid']>,
): string => {
  return `https://store.steampowered.com/app/${steamAppid}/`;
};

const generateGameListItemTitle = (
  name: GameModel['name'],
  steamAppid: GameModel['steamAppid'],
): string => {
  if (!steamAppid) {
    return name;
  }

  const steamAppUrl = generateSteamAppUrl(steamAppid);
  return `${hyperlink(name, hideLinkEmbed(steamAppUrl), 'View the game on steam.')}`;
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
  steamAppid,
  price,
}: GameModel): string => {
  const releaseDateMoment = moment(releaseDate);
  const isPastRelease = releaseDateMoment.isBefore(moment());
  const fromNow = releaseDateMoment.fromNow();
  const username = owners?.[0]?.username ?? 'nobody';
  const genreSummary = genres?.map(({ description }) => description)?.join(', ') ?? '';
  const categoryIcons = generateGameCategoryIcons(categories);
  const title = generateGameListItemTitle(name, steamAppid);
  return `${title} ${categoryIcons}\n${genreSummary}\nRelease${
    isPastRelease ? 'd' : 's'
  } ${fromNow} · Added by ${username} · €${price}`;
};

export const generateGameList = (games: GameModel[]): string => {
  return games.map(generateGameListItem).join('\n\r');
};

export const handleEmptyGameCount = async <T extends () => ReturnType<T>>(
  interaction: ChatInputCommandInteraction,
  fn: T,
): Promise<ReturnType<T> | string> => {
  const gameCount = await GameModel.count();
  const covetCommandMention = await generateChatInputApplicationMention(
    interaction,
    CommandName.AddGame,
  );

  // no game found
  if (gameCount === 0) {
    return `It seems nobody has added any games yet :sweat_smile:. Try adding a game using the ${covetCommandMention} command.`;
  }

  return fn();
};
