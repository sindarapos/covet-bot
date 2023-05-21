import { SteamAppDetail } from '../SteamAppDetail';
import { EmbedBuilder } from 'discord.js';

export const generateSteamAppEmbed = ({
  name,
  shortDescription,
  headerImage,
  genres,
  releaseDate: { date, comingSoon },
  priceOverview: { finalFormatted },
  website,
}: SteamAppDetail): EmbedBuilder => {
  const genresMessage = genres.map(({ description }) => description).join(', ');
  return new EmbedBuilder()
    .setTitle(name)
    .setDescription(shortDescription)
    .setImage(headerImage)
    .setFields(
      { name: 'Genres', value: genresMessage },
      { name: 'Release date', value: comingSoon ? 'coming soon' : date, inline: true },
      { name: 'Price', value: finalFormatted, inline: true },
    )
    .setURL(website);
};
