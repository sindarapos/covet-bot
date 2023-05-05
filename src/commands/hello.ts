import { Command, CommandName } from '../Command';
import { UserModel } from '../configuration/models/user.model';

const run: Command['run'] = async (interaction) => {
  const {
    user: { username, id },
  } = interaction;

  await interaction.deferReply({ ephemeral: true });

  const [user, created] = await UserModel.upsert({ discordUserId: id, username });
  const action = created ? 'registered' : 'recognized';
  await interaction.editReply({
    content: `Hello there, ${username}! you've been ${action} as ${user.id}`,
  });
};

export const hello: Command = {
  name: CommandName.Hello,
  description: 'Returns a greeting.',
  run,
};
