'use client';
import { today } from './dates';
import { must, sb } from './supabase';

export type WeekStats = { training_days: number; sets: number; reps: number; food_days: number; score: number };
export type BoardRow = { id: string; name: string; code: string; me: boolean; stats: WeekStats };
export type FriendRequest = { id: string; user_id: string; name: string; code: string };
export type FriendsData = { board: BoardRow[]; incoming: FriendRequest[]; outgoing: FriendRequest[] };

export type FriendDetail = {
  id: string; name: string; code: string; me: boolean; goal: 'cut' | 'bulk' | 'maintain' | null;
  targets: { kcal: number; protein: number; carbs: number | null; fat: number | null };
  eaten: { kcal: number; protein: number; carbs: number; fat: number };
  workout: null | {
    date: string; day_name: string;
    exercises: { name_en: string; name_ar: string; sets: number; reps: number; top_kg: number }[];
  };
  prs: { name_en: string; name_ar: string; weight_kg: number; reps: number; date: string }[];
  stats: WeekStats;
};

export type RequestResult = 'sent' | 'accepted' | 'pending' | 'already' | 'self' | 'notFound' | 'limit';

/** How the leaderboard score is made (also written in the app). */
export const SCORE = { trainingDay: 20, foodDay: 10, set: 1 } as const;

/** Keeps only digits, at most 6. */
export const cleanCode = (s: string) => s.replace(/[^0-9٠-٩]/g, '')
  .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).slice(0, 6);

export async function loadFriends(): Promise<FriendsData> {
  return must(await sb().rpc('bulkify_friends', { p_today: today() })) as FriendsData;
}
export async function loadFriend(id: string): Promise<FriendDetail> {
  return must(await sb().rpc('bulkify_friend_detail', { p_friend: id, p_today: today() })) as FriendDetail;
}
export async function requestFriend(code: string): Promise<RequestResult> {
  return must(await sb().rpc('bulkify_friend_request', { p_code: code })) as RequestResult;
}
export async function respondFriend(id: string, accept: boolean) {
  must(await sb().rpc('bulkify_friend_respond', { p_id: id, p_accept: accept }));
}
export async function removeFriend(userId: string) {
  must(await sb().rpc('bulkify_friend_remove', { p_other: userId }));
}
