import { Commands } from '../Command';

export const findCommandByName = (name: string) =>
  Commands.find((command) => command.name === name);
