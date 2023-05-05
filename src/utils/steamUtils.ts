import Fuse from 'fuse.js';
import { isSteamAppList, SteamApp } from '../SteamApp';

export const querySteamApps = (apps: SteamApp[], query: string): SteamApp[] => {
  const fuse = new Fuse(apps, {
    keys: ['name'],
    shouldSort: true,
    findAllMatches: true,
    threshold: 0.1,
  });
  return fuse.search(query).map((fuseResult) => fuseResult.item);
};

export const fetchSteamApps = async (): Promise<SteamApp[]> => {
  try {
    const response = await fetch(
      'https://api.steampowered.com/ISteamApps/GetAppList/v0002/?format=json',
    );
    const data = (await response.json()) as unknown;
    if (!isSteamAppList(data)) {
      return [];
    }
    return data.appList.apps;
  } catch (e) {
    throw new Error(`I was unable to contact steam`);
  }
};

export const findSteamApps = async (query: string): Promise<SteamApp[]> => {
  const apps = await fetchSteamApps();
  return querySteamApps(apps, query);
};
