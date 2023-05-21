import { isSteamAppList, SteamApp } from '../SteamApp.ts';
import {
  isSteamAppDetailResponse,
  SteamAppDetail,
  SteamAppDetailResponse,
} from '../SteamAppDetail.ts';
import { isRecord } from '../Record.ts';
import camelcaseKeys from 'camelcase-keys';
import { throttle } from '../utils/functionUtils.ts';
import Fuse from 'fuse.js';

export const fetchSteamApps = async (): Promise<SteamApp[]> => {
  try {
    const response = await fetch(
      'https://api.steampowered.com/ISteamApps/GetAppList/v0002/?format=json',
    );
    const data = (await response.json()) as unknown;
    if (!isSteamAppList(data)) {
      return [];
    }
    return data.applist.apps;
  } catch (e) {
    throw new Error(`I was unable to contact steam: ${e}`);
  }
};

export const steamAppDetailBySteamAppDetailResponse = (
  response: SteamAppDetailResponse,
  appid: string,
): SteamAppDetail | undefined => {
  const { data, success } = response[appid];
  if (!success) {
    return;
  }
  return data;
};

export const querySteamApps = (apps: SteamApp[], query: string): SteamApp[] => {
  const fuse = new Fuse(apps, {
    keys: ['name'],
    shouldSort: true,
    findAllMatches: true,
    threshold: 0.1,
  });
  return fuse.search(query).map((fuseResult) => fuseResult.item);
};

// Cache fetching of Steam app list
const throttledFetchSteamApps = throttle(fetchSteamApps, 60000);
export const findSteamApps = async (query: string): Promise<SteamApp[]> => {
  const apps = await throttledFetchSteamApps();
  return querySteamApps(apps, query);
};

export const findSteamAppDetails = async (
  query: string,
): Promise<SteamAppDetail | undefined> => {
  const apps = await throttledFetchSteamApps();
  const queriedApps = querySteamApps(apps, query);
  const app = queriedApps.at(0);
  if (!app) {
    return;
  }
  return await fetchSteamAppDetails(app.appid);
};

export const fetchSteamAppDetails = async (
  appid: SteamApp['appid'],
): Promise<SteamAppDetail | undefined> => {
  try {
    const response = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${appid}`,
    );
    const data: unknown = await response.json();
    if (!isRecord(data)) {
      return;
    }

    const camelCasedData: unknown = camelcaseKeys(data, { deep: true });
    if (!isSteamAppDetailResponse(camelCasedData)) {
      return;
    }

    return steamAppDetailBySteamAppDetailResponse(camelCasedData, appid.toString());
  } catch (e) {
    throw new Error(`I was unable to contact steam${e}`);
  }
};
