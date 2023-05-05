import { Command, CommandName } from '../Command';
import { UserModel } from '../configuration/models/userModel';

export const hello: Command = {
  name: CommandName.Hello,
  description: 'Returns a greeting',
  run: async (interaction) => {
    const { user: { username, id } } = interaction;

    await interaction.deferReply({ ephemeral: true });

    const [user] = await UserModel.upsert({ discordUserId: id, username });
    await interaction.editReply({
      content: `Hello there! ${username}, you've been registered as ${user?.id}`,
    });

  },
};
