export const publicFormThemes = ["terminal", "windowsxp", "standard", "code_editor"] as const;

export type PublicFormTheme = (typeof publicFormThemes)[number];

export const normalizeFormTheme = (theme: string): PublicFormTheme => {
  if (theme === "silicon_valley" || theme === "silicon_valley_3d") return "standard";
  if (theme === "windows95" || theme === "windows_xp") return "windowsxp";
  if (publicFormThemes.includes(theme as PublicFormTheme)) return theme as PublicFormTheme;
  return "standard";
};
