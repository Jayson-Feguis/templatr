"use client";

import { useEffect, useRef } from "react";
import { templates } from "@/lib/templates";
import type { PhotoBoothConfig } from "@/types/photo-booth";

interface TemplatePreviewProps {
  photos: string[];
  templateId: string;
  customBackground?: string;
  brandingConfig?: Pick<
    PhotoBoothConfig,
    "brandingType" | "brandingText" | "brandingFont" | "brandingImage"
  >;
}

/**
 * Safe image loader
 */
function loadImageSafe(src?: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => {
      console.warn("Failed to load image:", src);
      resolve(null);
    };
    img.src = src;
  });
}

/**
 * Draw image using "cover" behavior
 */
function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const imgRatio = img.width / img.height;
  const frameRatio = width / height;

  let sx = 0,
    sy = 0,
    sw = img.width,
    sh = img.height;

  if (imgRatio > frameRatio) {
    sw = img.height * frameRatio;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / frameRatio;
    sy = (img.height - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, x, y, width, height);
}

export default function TemplatePreview({
  photos,
  templateId,
  customBackground,
  brandingConfig,
}: TemplatePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isRenderingRef = useRef(false);

  useEffect(() => {
    if (isRenderingRef.current) return;
    isRenderingRef.current = true;

    renderTemplate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photos, templateId, customBackground, brandingConfig]);

  async function renderTemplate() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const template = templates.find((t) => t.id === templateId);
    if (!template) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = template.width;
    canvas.height = template.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    /* ---------------- BACKGROUND ---------------- */
    const bgImg = await loadImageSafe(
      template.backgroundImage ?? customBackground
    );

    if (bgImg) {
      drawCoverImage(ctx, bgImg, 0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = template.backgroundColor ?? "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    /* ---------------- POSITIONS (photos + overlays) ---------------- */
    await Promise.all(
      template.positions.map(async (pos, index) => {
        if (pos.src) {
          // Overlay or uploaded image
          const img = await loadImageSafe(pos.src);
          if (!img) return;

          ctx.save();
          ctx.beginPath();
          ctx.rect(pos.x, pos.y, pos.width, pos.height);
          ctx.clip();
          drawCoverImage(ctx, img, pos.x, pos.y, pos.width, pos.height);
          ctx.restore();
        } else if (photos[index]) {
          // Photo from photos array
          const img = await loadImageSafe(photos[index]);
          if (!img) return;

          ctx.save();
          ctx.beginPath();
          ctx.rect(pos.x, pos.y, pos.width, pos.height);
          ctx.clip();
          drawCoverImage(ctx, img, pos.x, pos.y, pos.width, pos.height);
          ctx.restore();
        }
      })
    );

    /* ---------------- BRANDING ---------------- */
    if (brandingConfig && brandingConfig.brandingType !== "none") {
      if (
        brandingConfig.brandingType === "text" &&
        brandingConfig.brandingText
      ) {
        let fontFamily = "sans-serif";
        if (brandingConfig.brandingFont === "Serif") fontFamily = "serif";
        if (brandingConfig.brandingFont === "Script") fontFamily = "cursive";
        if (brandingConfig.brandingFont === "Monospace")
          fontFamily = "monospace";

        ctx.fillStyle = template.brandingColor ?? "#ffffff";
        ctx.font = `28px ${fontFamily}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillText(
          brandingConfig.brandingText,
          canvas.width / 2,
          canvas.height - 30
        );
      }

      if (
        brandingConfig.brandingType === "image" &&
        brandingConfig.brandingImage
      ) {
        const logoImg = await loadImageSafe(brandingConfig.brandingImage);

        if (logoImg) {
          const maxHeight = 60;
          const scale = Math.min(
            maxHeight / logoImg.height,
            (canvas.width * 0.8) / logoImg.width
          );

          const w = logoImg.width * scale;
          const h = logoImg.height * scale;
          const x = (canvas.width - w) / 2;
          const y = canvas.height - h - 20;

          ctx.drawImage(logoImg, x, y, w, h);
        }
      }
    } else if (template.brandingText) {
      ctx.fillStyle = template.brandingColor ?? "#ffffff";
      ctx.font = "24px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.fillText(template.brandingText, canvas.width / 2, canvas.height - 30);
    }

    isRenderingRef.current = false;
  }

  return (
    <div className="flex justify-center">
      <canvas
        ref={canvasRef}
        id="final-template"
        className="max-w-full rounded-lg border border-border shadow-lg"
      />
    </div>
  );
}
