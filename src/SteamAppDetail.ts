import { isRecord, isRecordWithProperties } from './Record';
import { SteamApp } from './SteamApp';

interface SteamAppCategory {
  id: string;
  description: string;
}

interface SteamAppGenre {
  id: string;
  description: string;
}

interface SteamAppReleaseDate {
  comingSoon: boolean;
  date: string;
}

interface SteamAppPriceOverview {
  initialFormatted: string;
  finalFormatted: string;
}

export interface SteamAppDetail extends Omit<SteamApp, 'appid'> {
  type: string;
  shortDescription: string;
  headerImage: string;
  website: string;
  genres: SteamAppGenre[];
  categories: SteamAppCategory[];
  releaseDate: SteamAppReleaseDate;
  priceOverview: SteamAppPriceOverview;
}

export type SteamAppDetailResponse = Record<
  string,
  {
    success: boolean;
    data: SteamAppDetail;
  }
>;

function isSteamAppPriceOverview<T extends Record<keyof T, T>>(
  element: unknown,
): element is SteamAppPriceOverview {
  if (!isRecordWithProperties(element, ['initialFormatted', 'finalFormatted'] as const)) {
    return false;
  }
  const { initialFormatted, finalFormatted } = element;
  return typeof initialFormatted === 'string' && typeof finalFormatted === 'string';
}

function isSteamAppReleaseDate<T extends Record<keyof T, T>>(
  element: unknown,
): element is SteamAppReleaseDate {
  if (!isRecordWithProperties(element, ['comingSoon', 'date'] as const)) {
    return false;
  }
  const { comingSoon, date } = element;
  return typeof comingSoon === 'boolean' && typeof date === 'string';
}

function isSteamAppGenres<T extends Record<keyof V, V>[], V = keyof T[number]>(
  element: unknown,
): element is SteamAppGenre[] {
  if (!Array.isArray(element)) {
    return false;
  }
  return element.every((entry) => {
    if (!isRecordWithProperties(entry, ['id', 'description'] as const)) {
      return false;
    }
    const { id, description } = entry;
    return typeof id === 'string' && typeof description === 'string';
  });
}

function isSteamAppCategories<T extends Record<keyof V, V>[], V = keyof T[number]>(
  element: unknown,
): element is SteamAppCategory[] {
  if (!Array.isArray(element)) {
    return false;
  }
  return element.every((entry) => {
    if (!isRecordWithProperties(entry, ['id', 'description'] as const)) {
      return false;
    }
    const { id, description } = entry;
    return typeof id === 'number' && typeof description === 'string';
  });
}

function isSteamAppDetail<T extends Record<keyof T, T>>(
  element: unknown,
): element is SteamAppDetail {
  if (
    !isRecordWithProperties(element, [
      'headerImage',
      'releaseDate',
      'shortDescription',
      'type',
      'website',
      'priceOverview',
      'genres',
      'categories',
    ] as const)
  ) {
    return false;
  }

  const { releaseDate, priceOverview, genres, categories } = element;

  if (!isSteamAppReleaseDate(releaseDate)) {
    return false;
  }

  if (!isSteamAppGenres(genres)) {
    return false;
  }

  if (!isSteamAppCategories(categories)) {
    return false;
  }

  return isSteamAppPriceOverview(priceOverview);
}

export function isSteamAppDetailResponse<T extends Record<keyof T, T>>(
  element: unknown,
): element is SteamAppDetailResponse {
  if (!isRecord(element)) {
    return false;
  }
  const values = Object.values(element);

  return values.every((value) => {
    if (!isRecordWithProperties(value, ['success', 'data'] as const)) {
      console.log('no success or data');
      return false;
    }
    const { success, data } = value;

    if (typeof success !== 'boolean') {
      console.log('success is not a boolean');
      return false;
    }

    return isSteamAppDetail(data);
  });
}
