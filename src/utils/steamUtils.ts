import { SteamAppDetail } from '../SteamAppDetail';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  EmbedBuilder,
  Message,
} from 'discord.js';
import { findSteamAppDetails } from '../services/steamService';
import { ButtonCustomIds, generateGameEmbeds } from './gameUtils';
import { MessageActionRowComponentBuilder } from '@discordjs/builders';

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

const generateCreationActionRow =
  (): ActionRowBuilder<MessageActionRowComponentBuilder> => {
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

  const embeds = generateGameEmbeds([details]);
  const row = generateCreationActionRow();
  const message = await interaction.editReply({
    content,
    embeds,
    components: [row],
  });
  return [details, message];
};
