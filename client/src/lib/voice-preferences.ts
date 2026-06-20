import type { User, UserPreferences } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { PhonicsPace } from "@/lib/speech";

export const DEFAULT_VOICE_PREFERENCES: Required<UserPreferences> = {
  kokoroEnabled: false,
  aiReadingCoachEnabled: true,
  phonicsPace: "slow",
  kokoroVoiceId: "af_heart",
};

export function normalizePreferences(prefs?: UserPreferences | null): Required<UserPreferences> {
  return {
    kokoroEnabled: prefs?.kokoroEnabled ?? DEFAULT_VOICE_PREFERENCES.kokoroEnabled,
    aiReadingCoachEnabled: prefs?.aiReadingCoachEnabled ?? DEFAULT_VOICE_PREFERENCES.aiReadingCoachEnabled,
    phonicsPace: prefs?.phonicsPace ?? DEFAULT_VOICE_PREFERENCES.phonicsPace,
    kokoroVoiceId: prefs?.kokoroVoiceId ?? DEFAULT_VOICE_PREFERENCES.kokoroVoiceId,
  };
}

export function applyPreferencesToLocalStorage(prefs?: UserPreferences | null): Required<UserPreferences> {
  const normalized = normalizePreferences(prefs);
  localStorage.setItem("kokoroEnabled", normalized.kokoroEnabled.toString());
  localStorage.setItem("aiReadingCoachEnabled", normalized.aiReadingCoachEnabled.toString());
  localStorage.setItem("phonicsPace", normalized.phonicsPace);
  localStorage.setItem("kokoroVoiceId", normalized.kokoroVoiceId);
  return normalized;
}

export function loadPreferencesFromLocalStorage(): Required<UserPreferences> {
  return normalizePreferences({
    kokoroEnabled: localStorage.getItem("kokoroEnabled") === "true",
    aiReadingCoachEnabled: localStorage.getItem("aiReadingCoachEnabled") !== "false",
    phonicsPace: (localStorage.getItem("phonicsPace") === "normal" ? "normal" : "slow") as PhonicsPace,
    kokoroVoiceId: localStorage.getItem("kokoroVoiceId") || DEFAULT_VOICE_PREFERENCES.kokoroVoiceId,
  });
}

export async function hydratePreferencesForUser(userId: number): Promise<Required<UserPreferences>> {
  const user = await fetch(`/api/user/${userId}`).then((res) => res.json() as Promise<User>);
  return applyPreferencesToLocalStorage(user.preferences);
}

export async function savePreferences(
  userId: number,
  prefs: UserPreferences,
): Promise<User> {
  const user = await apiRequest(`/api/user/${userId}/preferences`, "PATCH", prefs);
  applyPreferencesToLocalStorage(user.preferences);
  queryClient.invalidateQueries({ queryKey: ["/api/user", userId.toString()] });
  queryClient.invalidateQueries({ queryKey: ["/api/user", userId] });
  return user;
}
