import { Command, CommandName } from "../Command";

const hello: Command = {
  name: CommandName.Hello,
  description: "Returns a greeting",
  run: async (interaction) => {
    const content = "Hello there!";

    await interaction.reply({
      ephemeral: true,
      content,
    });
  },
};

export default hello;
