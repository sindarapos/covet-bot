import { commands } from '../Command';
import {
  AutocompleteInteraction,
  ButtonInteraction,
  ChatInputCommandInteraction,
  CommandInteraction,
  Message,
} from 'discord.js';
import moment from 'moment';

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

export const generateInitiatorMessageComponentCollector = async (
  message: Message,
  interaction: ChatInputCommandInteraction,
): Promise<ButtonInteraction | undefined> => {
  const time = moment.duration(1, 'minutes').asMilliseconds();
  return await message
    .awaitMessageComponent<2>({
      filter: (i) => i.user.id === interaction.user.id,
      time,
    })
    .catch(async () => {
      console.log('No interactions have been received after', time, 'ms');
      await interaction.deleteReply(message);
      return undefined;
    });
};
