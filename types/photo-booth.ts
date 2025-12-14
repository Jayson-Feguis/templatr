export interface PhotoBoothConfig {
  photoCount: number;
  intervalSeconds: number;
  templateId: string;
  customBackground?: string;
  brandingType: "text" | "image" | "none";
  brandingText?: string;
  brandingFont?: string;
  brandingImage?: string;
}

export interface PhotoPosition {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isOverlay?: boolean; // true for overlay images
  src?: string; // overlay image URL
  name?: string; // overlay name
}

export interface PhotoBoothTemplate {
  id: string;
  name: string;
  description: string;
  width: number;
  height: number;
  backgroundColor: string;
  backgroundImage?: string;
  positions: PhotoPosition[]; // holds both photo slots and overlays
  brandingText?: string;
  brandingColor?: string;
  isCustom?: boolean;
}
