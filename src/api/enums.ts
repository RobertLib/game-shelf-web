export const PLATFORMS = [
  // Nintendo – home consoles
  "NES",
  "SNES",
  "Nintendo 64",
  "GameCube",
  "Wii",
  "Wii U",
  "Nintendo Switch",
  "Nintendo Switch 2",
  // Nintendo – handhelds
  "Game Boy",
  "Game Boy Color",
  "Game Boy Advance",
  "Nintendo DS",
  "Nintendo 3DS",
  // Sega
  "Sega Master System",
  "Sega Mega Drive",
  "Sega Saturn",
  "Sega Dreamcast",
  "Sega Game Gear",
  "Sega CD",
  "Sega 32X",
  // Sony
  "PlayStation",
  "PlayStation 2",
  "PlayStation 3",
  "PlayStation 4",
  "PlayStation 5",
  "PSP",
  "PS Vita",
  // Microsoft
  "Xbox",
  "Xbox 360",
  "Xbox One",
  "Xbox Series X/S",
  // Atari
  "Atari 2600",
  "Atari 5200",
  "Atari 7800",
  "Atari Jaguar",
  "Atari Lynx",
  // PC
  "PC",
  "Mac",
  // Other
  "Neo Geo",
  "Neo Geo Pocket Color",
  "TurboGrafx-16",
  "Commodore 64",
  "Amiga",
  "ZX Spectrum",
  "MSX",
  "Arcade",
] as const;

export type Platform = (typeof PLATFORMS)[number];

export const REGIONS = [
  "EUR",
  "USA",
  "JPN",
  "AUS",
  "KOR",
  "CHN",
  "BRA",
  "World",
] as const;

export type Region = (typeof REGIONS)[number];

export const CONDITIONS = [
  "Mint",
  "Near Mint",
  "Very Good",
  "Good",
  "Fair",
  "Poor",
] as const;

export type Condition = (typeof CONDITIONS)[number];
