import regionsData from '../../public/data/regions.json';

type Language = 'ar' | 'en' | 'fr';
type RegionNames = Record<Language, string>;

interface Region {
  id: number;
  names: RegionNames;
}

interface RegionsResponse {
  count: number;
  data: Region[];
}

// Get all regions
export const getAllRegions = (): Region[] => {
  return regionsData.regions.data;
};

// Get region by ID with language support
export const getRegionById = (id: number, lang: Language = 'en'): string => {
  const region = regionsData.regions.data.find((r) => r.id === id);
  return region ? region.names[lang] : 'Unknown Region';
};

// Get all regions formatted for dropdown/select
export const getRegionsForSelect = (lang: Language = 'en'): { value: number; label: string }[] => {
  return regionsData.regions.data.map((region) => ({
    value: region.id,
    label: region.names[lang],
  }));
};