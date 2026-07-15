export interface ThemeManifest {
  name: string;
  description: string;
  layouts: { name: string; content: string }[];
  assets: { path: string; content: string }[];
}
