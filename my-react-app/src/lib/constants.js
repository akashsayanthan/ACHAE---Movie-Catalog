// ─── TMDB CONFIG ──────────────────────────────────────────────────────────────
export const API_KEY = "1d0b000b8bbf7d95bdfa6bfd876956e5";
export const BASE_URL = "https://api.themoviedb.org/3";
export const IMG_BASE = "https://image.tmdb.org/t/p/w500";

// TMDB genre ID → name map
export const GENRE_MAP = {
  28: "Action",   12: "Adventure", 16: "Animation", 35: "Comedy",
  80: "Crime",    99: "Documentary", 18: "Drama",   10751: "Family",
  14: "Fantasy",  36: "History",   27: "Horror",    10402: "Music",
  9648: "Mystery", 10749: "Romance", 878: "Sci-Fi", 10770: "TV Movie",
  53: "Thriller", 10752: "War",    37: "Western",
};

// Accent colors cycled per card
export const ACCENTS = [
  "#C47D1A", "#2E6FA3", "#8A7A3A", "#3A8A3A",
  "#B5671A", "#9A5A30", "#B83A10", "#A83060",
  "#4A7A8A", "#7A3A8A", "#3A5A8A", "#8A3A4A",
];

export function formatIndex(n) {
  return String(n + 1).padStart(3, "0");
}