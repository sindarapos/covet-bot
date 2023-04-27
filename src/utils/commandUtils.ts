import { commands } from '../Command';
import { CommandInteraction } from 'discord.js';

export const findCommandByName = (name: string) =>
  commands.find((command) => command.name === name);

export const logCommand = (interaction: CommandInteraction) => {
  const { user, commandName } = interaction;
  const optionValues = interaction?.options?.data?.map((option) => option?.value) ?? [];
  const joinedOptionValues = optionValues?.join(', ');

  console.log(`User ${user.tag} (${user.id}) used /${commandName} with arguments ${joinedOptionValues}.`);
};
