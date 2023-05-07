import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  Client,
  ClientApplication,
  Events,
  Interaction,
} from 'discord.js';
import { findCommandByName, logCommand } from '../utils/commandUtils';
import { Command } from '../Command';

const handleAutocomplete = async (
  command: Command,
  interaction: Parameters<NonNullable<Command['autocomplete']>>[0],
) => {
  try {
    logCommand(interaction);
    await command.autocomplete?.(interaction);
  } catch (error) {
    console.error(error);
  }
};

const handleRun = async (
  command: Command,
  interaction: Parameters<Command['run']>[0],
) => {
  try {
    logCommand(interaction);
    await command.run(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: `There was an error while executing ${interaction.commandName}!`,
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: `There was an error while executing ${interaction.commandName}!`,
        ephemeral: true,
      });
    }
  }
};

const handleCommand = async (
  command: Command,
  interaction:
    | Parameters<Command['run']>[0]
    | Parameters<NonNullable<Command['autocomplete']>>[0],
): Promise<void> => {
  if (interaction.isAutocomplete()) {
    await handleAutocomplete(command, interaction);
    return;
  }

  if (interaction.isChatInputCommand()) {
    await handleRun(command, interaction);
  }
};

export const interactionCreate = (client: Client): void => {
  client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    if (
      !(
        interaction instanceof ChatInputCommandInteraction ||
        interaction instanceof AutocompleteInteraction
      ) ||
      !(client.application instanceof ClientApplication)
    ) {
      return;
    }

    const command = findCommandByName(interaction.commandName);

    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    await handleCommand(command, interaction);
  });
};
