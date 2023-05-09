import {
  AutocompleteInteraction,
  ChatInputApplicationCommandData,
  ChatInputCommandInteraction,
} from 'discord.js';
import { hello } from './commands/hello';
import { findGame } from './commands/findGame';
import { addGame } from './commands/addGame';

export const enum CommandName {
  Hello = 'hello',
  FindGame = 'find',
  AddGame = 'covet',
}

export interface Command extends ChatInputApplicationCommandData {
  name: CommandName;
  run: (interaction: ChatInputCommandInteraction) => Promise<void>;
  autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
}

export const commands: Command[] = [hello, findGame, addGame];
