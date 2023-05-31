import { isSteamAppList, isSteamAppResponse, SteamApp } from '../SteamApp';
import {
  isSteamAppDetailResponse,
  SteamAppDetail,
  SteamAppDetailResponse,
} from '../SteamAppDetail';
import { isRecord } from '../Record';
import camelcaseKeys from 'camelcase-keys';
import { throttle } from '../utils/functionUtils';
import * as process from 'process';
import moment from 'moment';
import MiniSearch from 'minisearch';

export const fetchSteamApps = async (startId = 0): Promise<SteamApp[]> => {
  const response = await fetch(
    `https://api.steampowered.com/IStoreService/GetAppList/v1/?key=${process.env.STEAM_API_KEY}&last_appid=${startId}&max_results=40000`,
  );
  const data = (await response.json()) as unknown;
  if (!isRecord(data)) {
    return [];
  }

  const camelCasedData: unknown = camelcaseKeys(data, { deep: true });
  if (!isSteamAppResponse(camelCasedData)) {
    return [];
  }

  const { apps, haveMoreResults, lastAppid } = camelCasedData.response;
  if (!haveMoreResults || !lastAppid) {
    return apps;
  }
  const nextApps = await fetchSteamApps(lastAppid);
  return apps.concat(nextApps);
};

export const fetchPublicSteamApps = async (): Promise<SteamApp[]> => {
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

const generateSteamAppMiniSearch = (apps: SteamApp[]): MiniSearch<SteamApp> => {
  const miniSearch = new MiniSearch<SteamApp>({
    fields: ['name'],
    storeFields: ['name', 'appid'],
    idField: 'appid',
  });
  miniSearch.addAll(apps);
  return miniSearch;
};

const throttledGenerateSteamAppMiniSearch = throttle(
  generateSteamAppMiniSearch,
  moment.duration(4, 'hours').asMilliseconds(),
);

export const querySteamApps = (apps: SteamApp[], query: string): SteamApp[] => {
  const miniSearch = throttledGenerateSteamAppMiniSearch(apps);
  return miniSearch.search(query).map(({ appid, name }) => ({
    appid: appid as number,
    name: name as string,
  }));
};

// Cache fetching of Steam app list
const throttledFetchSteamApps = throttle(
  fetchSteamApps,
  moment.duration(4, 'hours').asMilliseconds(),
);

export const findSteamApps = async (query: string): Promise<SteamApp[]> => {
  try {
    const apps = await throttledFetchSteamApps();
    return querySteamApps(apps, query);
  } catch (e) {
    throw new Error(`I ran into an error fetching steam games: ${e}`);
  }
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
  countryCode = 'nl',
): Promise<SteamAppDetail | undefined> => {
  try {
    const response = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${appid}&cc=${countryCode}`,
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
