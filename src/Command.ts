import { ChatInputApplicationCommandData, CommandInteraction } from 'discord.js';
import { hello } from './commands/hello';
import { findGame } from './commands/findGame';

export const enum CommandName {
  Hello = 'hello',
  FindGame = 'find',
}

export interface BaseCommand extends ChatInputApplicationCommandData {
  name: CommandName;
}

type Executor = (interaction: CommandInteraction) => Promise<void>;

export type Command = BaseCommand & ({ run: Executor } | { autocomplete: Executor });

export const commands: Command[] = [hello, findGame];
