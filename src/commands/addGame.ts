import { Command, CommandName } from '../Command';
import { findSteamAppDetails } from '../utils/steamUtils';
import { findGame } from './findGame';
import { SteamAppDetail } from '../SteamAppDetail';
import {
  ActionRowBuilder,
  bold,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  EmbedBuilder,
  italic,
  Message,
} from 'discord.js';
import { MessageActionRowComponentBuilder } from '@discordjs/builders';

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

const generateSteamAppEmbed = ({
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
) => {
  return await message.awaitMessageComponent({
    filter: (i) => i.user.id === interaction.user.id,
    time: 300000,
  });
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
    const details = await findSteamAppDetails(query);

    if (!details) {
      await interaction.editReply({
        content: `Sorry, I wasn't able to find "${query}" in the Steam store :sweat:.`,
      });
      return;
    }

    const embed = generateSteamAppEmbed(details);
    const row = generateActionRow();
    const message = await interaction.editReply({
      content: "Is this the game you'd like to add?",
      embeds: [embed],
      components: [row],
    });

    try {
      const confirm = await generateResponseCollector(message, interaction);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
      switch (confirm.customId) {
        case ButtonCustomIds.confirm:
          await confirm.update({
            content: `Great :thumbsup:! The game ${bold(details.name)} has been added!`,
            embeds: [],
            components: [],
          });
          break;
        case ButtonCustomIds.edit:
          await confirm.update({
            content: `Sorry :cry:! This feature is not yet implemented.`,
            embeds: [],
            components: [],
          });
          break;
        case ButtonCustomIds.cancel:
          await confirm.update({
            content: `Cancelling... the game ${bold(details.name)} has ${italic(
              'not',
            )} been added.`,
            embeds: [],
            components: [],
          });
          break;
      }
    } catch (e) {
      await interaction.editReply({
        content: 'Confirmation not received within 5 minutes, cancelling',
        components: [],
      });
    }
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
