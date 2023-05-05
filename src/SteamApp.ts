export interface SteamApp {
  id: number;
  name: string;
}

export interface SteamAppList {
  appList: {
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
    return;
  }
  return prop in element;
}

function isSteamApp(element: unknown): element is SteamApp {
  return isRecordWithProperties(element, ['id' as const, 'name' as const]);
}

export function isSteamAppList(element: unknown): element is SteamAppList {
  if (!isRecordWithProperties(element, ['appList' as const])) {
    return;
  }
  const { appList } = element;
  if (!isRecordWithProperties(appList, ['apps' as const])) {
    return;
  }
  const { apps } = appList;
  if (!Array.isArray(apps)) {
    return;
  }

  // Only check the first member for speed
  const app: unknown = apps[0];
  if (!app) {
    return true;
  }

  return isSteamApp(app);
}
