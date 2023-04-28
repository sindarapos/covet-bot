import {
  Client,
  ClientApplication,
  CommandInteraction,
  Events,
  Interaction,
} from 'discord.js';
import { findCommandByName, logCommand } from '../utils/commandUtils';
import { Command } from '../Command';

const handleCommand = async (
  command: Command,
  interaction: CommandInteraction,
): Promise<void> => {
  try {
    logCommand(interaction);
    await command.run(interaction);
  }
  catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: `There was an error while executing ${interaction?.commandName}!`,
        ephemeral: true,
      });
    }
    else {
      await interaction.reply({
        content: `There was an error while executing ${interaction?.commandName}!`,
        ephemeral: true,
      });
    }
  }
};

export const interactionCreate = (client: Client): void => {
  client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    if (
      !interaction.isChatInputCommand() ||
      !(interaction instanceof CommandInteraction) ||
      !(client.application instanceof ClientApplication)
    ) {
      return;
    }

    const command = findCommandByName(interaction.commandName);

    if (!command) {
      console.error(
        `No command matching ${interaction.commandName} was found.`,
      );
      return;
    }

    await handleCommand(command, interaction);
  });
};
