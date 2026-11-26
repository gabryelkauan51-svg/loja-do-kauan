import type { GameSlug } from '../types';

export interface GameInfo {
  slug: GameSlug;
  label: string;
  /** Subtítulo curto exibido no menu de jogos. */
  subtitle: string;
  /** Cor de destaque usada no hero e nos detalhes. */
  accent: string;
  emoji: string;
}

export const GAMES: GameInfo[] = [
  { slug: 'valorant', label: 'Valorant', subtitle: 'FPS tático · Skins e agentes', accent: '#FF4655', emoji: '🎯' },
  { slug: 'fortnite', label: 'Fortnite', subtitle: 'Battle royale · Skins e V-Bucks', accent: '#A855F7', emoji: '🪂' },
  { slug: 'steam', label: 'Steam', subtitle: 'Contas com biblioteca de jogos', accent: '#38BDF8', emoji: '💨' },
  { slug: 'roblox', label: 'Roblox', subtitle: 'Contas com Robux e itens', accent: '#F43F5E', emoji: '🧱' },
  { slug: 'league-of-legends', label: 'League of Legends', subtitle: 'MOBA · Campeões e skins', accent: '#C8A04A', emoji: '⚔️' },
  { slug: 'clash-royale', label: 'Clash Royale', subtitle: 'Estratégia · Cartas e troféus', accent: '#3B82F6', emoji: '👑' },
  { slug: 'genshin-impact', label: 'Genshin Impact', subtitle: 'RPG · Personagens e gemas', accent: '#2DD4BF', emoji: '✨' },
  { slug: 'brawl-stars', label: 'Brawl Stars', subtitle: 'Ação · Brawlers e troféus', accent: '#FACC15', emoji: '⭐' },
  { slug: 'rocket-league', label: 'Rocket League', subtitle: 'Futebol de carros · Itens', accent: '#0EA5E9', emoji: '🚗' },
  { slug: 'epic-games', label: 'Epic Games', subtitle: 'Contas com biblioteca de jogos', accent: '#E4E4E7', emoji: '🎮' },
  { slug: 'ea', label: 'EA', subtitle: 'Contas EA App com jogos', accent: '#F97316', emoji: '🏆' },
  { slug: 'ubisoft', label: 'Ubisoft', subtitle: 'Contas Ubisoft Connect', accent: '#60A5FA', emoji: '🌀' },
];

export function gameInfo(slug: GameSlug): GameInfo {
  return GAMES.find((g) => g.slug === slug) ?? GAMES[0];
}

export function gameEmoji(slug: GameSlug): string {
  return GAMES.find((g) => g.slug === slug)?.emoji ?? '🎮';
}
