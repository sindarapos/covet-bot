import { Command, CommandName } from '../Command';

export const hello: Command = {
  name: CommandName.Hello,
  description: 'Returns a greeting',
  run: async (interaction) => {
    const content = 'Hello there!';

    await interaction.reply({
      ephemeral: true,
      content,
    });
  },
};
