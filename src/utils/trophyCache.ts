import AsyncStorage from "@react-native-async-storage/async-storage";

const CACHE_KEY = "trophy_data_cache";

/**
 * Saves trophy data to local storage.
 */
export const saveTrophyCache = async <T>(data: T): Promise<void> => {
  try {
    const payload = JSON.stringify(data);
    await AsyncStorage.setItem(CACHE_KEY, payload);
    console.log("💾 [Cache] Saved trophy data to disk");
  } catch (e) {
    console.error("❌ Failed to save trophy cache", e);
  }
};

/**
 * Loads trophy data from local storage.
 * Returns null if no data exists or parsing fails.
 */
export const loadTrophyCache = async <T>(): Promise<T | null> => {
  try {
    const json = await AsyncStorage.getItem(CACHE_KEY);
    return json ? (JSON.parse(json) as T) : null;
  } catch (e) {
    console.error("❌ Failed to load trophy cache", e);
    return null;
  }
};

/**
 * Clears the trophy cache.
 * Useful for logout or forced refresh.
 */
export const clearTrophyCache = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(CACHE_KEY);
    console.log("🧹 [Cache] Cleared trophy data");
  } catch (e) {
    console.error("❌ Failed to clear trophy cache", e);
  }
};
