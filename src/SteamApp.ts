import { isRecordWithProperties } from './Record';

export interface SteamApp {
  appid: number;
  name: string;
}

export interface SteamAppContainer {
  apps: SteamApp[];
}

export interface SteamAppResponse {
  response: {
    haveMoreResults?: boolean;
    lastAppid?: number;
  } & SteamAppContainer;
}

export interface SteamAppList {
  applist: SteamAppContainer;
}

function isSteamApp(element: unknown): element is SteamApp {
  return isRecordWithProperties(element, ['appid' as const, 'name' as const]);
}

export function isSteamAppContainer(element: unknown): element is SteamAppContainer {
  if (!isRecordWithProperties(element, ['apps' as const])) {
    console.log('Has no apps');
    return false;
  }
  const { apps } = element;
  if (!Array.isArray(apps)) {
    console.log('Apps is not an array');
    return false;
  }

  // Only check the first member for speed
  const app: unknown = apps[0];
  if (!app) {
    console.log('First app is empty');
    return false;
  }

  return isSteamApp(app);
}

export function isSteamAppResponse(element: unknown): element is SteamAppResponse {
  if (!isRecordWithProperties(element, ['response'] as const)) {
    console.log('Is missing response');
    return false;
  }
  const { response } = element;
  return isSteamAppContainer(response);
}

export function isSteamAppList(element: unknown): element is SteamAppList {
  if (!isRecordWithProperties(element, ['applist' as const])) {
    console.log('Has no applist');
    return false;
  }
  const { applist } = element;
  return isSteamAppContainer(applist);
}
