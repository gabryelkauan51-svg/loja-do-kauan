import type { GameSlug } from '../types';

export const GAMES: { slug: GameSlug; label: string; emoji: string }[] = [
  { slug: 'valorant', label: 'Valorant', emoji: '🎯' },
  { slug: 'fortnite', label: 'Fortnite', emoji: '🪂' },
  { slug: 'steam', label: 'Steam', emoji: '💨' },
  { slug: 'roblox', label: 'Roblox', emoji: '🧱' },
  { slug: 'league-of-legends', label: 'League of Legends', emoji: '⚔️' },
  { slug: 'clash-royale', label: 'Clash Royale', emoji: '👑' },
  { slug: 'genshin-impact', label: 'Genshin Impact', emoji: '✨' },
  { slug: 'brawl-stars', label: 'Brawl Stars', emoji: '⭐' },
  { slug: 'rocket-league', label: 'Rocket League', emoji: '🚗' },
  { slug: 'epic-games', label: 'Epic Games', emoji: '🎮' },
  { slug: 'ea', label: 'EA', emoji: '🏆' },
  { slug: 'ubisoft', label: 'Ubisoft', emoji: '🌀' },
];

export function gameEmoji(slug: GameSlug): string {
  return GAMES.find((g) => g.slug === slug)?.emoji ?? '🎮';
}
