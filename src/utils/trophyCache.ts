import AsyncStorage from "@react-native-async-storage/async-storage";

const CACHE_KEY = "trophy_data_cache";

export const saveTrophyCache = async (data: any) => {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
    console.log("💾 [Cache] Saved trophy data to disk");
  } catch (e) {
    console.warn("Failed to save trophy cache", e);
  }
};

export const loadTrophyCache = async () => {
  try {
    const json = await AsyncStorage.getItem(CACHE_KEY);
    return json ? JSON.parse(json) : null;
  } catch (e) {
    console.warn("Failed to load trophy cache", e);
    return null;
  }
};
