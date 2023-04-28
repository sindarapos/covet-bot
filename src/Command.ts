import {
  ChatInputApplicationCommandData,
  CommandInteraction,
} from 'discord.js';
import { hello } from './commands/hello';
import { findGame } from './commands/findGame';

export const enum CommandName {
  Hello = 'hello',
  FindGame = 'find',
}

export interface Command extends ChatInputApplicationCommandData {
  run: (interaction: CommandInteraction) => void;
  name: CommandName;
}

export const commands: Command[] = [hello, findGame];
