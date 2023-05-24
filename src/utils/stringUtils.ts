import { SnakeToCamelCase } from '../Record';
import { CommandName } from '../Command';
import {
  chatInputApplicationCommandMention,
  ChatInputCommandInteraction,
} from 'discord.js';

export const summaryFormatter = (list: string[], limit = 3, separator = ', '): string => {
  if (list.length <= limit) {
    return list.join(separator);
  }

  const firstItems = list.slice(0, limit);
  return `${firstItems.join(separator)} and ${list.length - limit} more`;
};

export const snakeToCamelCase = <T extends string>(value: T): SnakeToCamelCase<T> => {
  const parts = value.split('_');
  return parts.reduce((accumulator, part, i) => {
    let result = part;
    if (i > 0) {
      result = part[0].toUpperCase() + part.slice(1);
    }
    return `${accumulator}${result}`;
  }, '') as SnakeToCamelCase<T>;
};

export const generateChatInputApplicationMention = async <T extends CommandName>(
  interaction: ChatInputCommandInteraction,
  commandName: T,
): Promise<`</${T}:${string}>` | `/${T}`> => {
  const commands = await interaction.client.application.commands.fetch();
  const command = commands.find(
    (command) =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
      command.name === CommandName.AddGame,
  );

  if (!command) {
    return `/${commandName}`;
  }

  return chatInputApplicationCommandMention(commandName, command.id);
};
