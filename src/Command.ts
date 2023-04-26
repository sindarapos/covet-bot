import {
  ChatInputApplicationCommandData,
  CommandInteraction,
} from "discord.js";
import hello from "./commands/hello";

export const enum CommandName {
  Hello = "hello",
}

export interface Command extends ChatInputApplicationCommandData {
  run: (interaction: CommandInteraction) => void;
  name: CommandName;
}

export const Commands: Command[] = [hello];
