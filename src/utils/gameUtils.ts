import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  Message,
} from 'discord.js';
import { SteamAppDetail } from '../SteamAppDetail';
import { findSteamAppDetails } from '../services/steamService';
import { generateSteamAppEmbed } from './steamUtils';
import { MessageActionRowComponentBuilder } from '@discordjs/builders';

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
