export interface SteamApp {
  appid: number;
  name: string;
}

export interface SteamAppList {
  applist: {
    apps: SteamApp[];
  };
}

function isRecord(element: unknown): element is Record<string, unknown> {
  return !!element && Object.getPrototypeOf(element) === Object.prototype;
}

function isRecordWithProperties<K extends PropertyKey[]>(
  element: unknown,
  prop: K,
): element is Record<K[number], unknown> {
  if (!isRecord(element)) {
    return false;
  }
  return prop.every((value) => value in element);
}

function isSteamApp(element: unknown): element is SteamApp {
  return isRecordWithProperties(element, ['appid' as const, 'name' as const]);
}

export function isSteamAppList(element: unknown): element is SteamAppList {
  if (!isRecordWithProperties(element, ['applist' as const])) {
    console.log('Has no applist');
    return false;
  }
  const { applist } = element;
  if (!isRecordWithProperties(applist, ['apps' as const])) {
    console.log('Has no apps');
    return false;
  }
  const { apps } = applist;
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
