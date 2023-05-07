import { commands } from '../Command';
import { AutocompleteInteraction, CommandInteraction } from 'discord.js';

export const findCommandByName = (name: string) => {
  return commands.find((command) => command.name.valueOf() === name.valueOf());
};

export const logCommand = (interaction: CommandInteraction | AutocompleteInteraction) => {
  const { user, commandName } = interaction;
  const optionValues = interaction.options.data.map((option) => option.value);
  const joinedOptionValues = optionValues.join(', ');

  console.log(
    `User ${user.tag} (${user.id}) used /${commandName} with arguments ${joinedOptionValues}.`,
  );
};
