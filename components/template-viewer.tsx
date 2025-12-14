import { PhotoBoothTemplate } from "@/types/photo-booth";
import React from "react";

interface TemplateViewerProps {
  template: PhotoBoothTemplate;
  scale?: number; // optional, default is 0.3 (30% of original)
}

export default function TemplateViewer({
  template,
  scale = 0.3,
}: TemplateViewerProps) {
  const { width, height, backgroundColor, positions, backgroundImage } =
    template;

  const scaledWidth = width * scale;
  const scaledHeight = height * scale;

  return (
    <div
      style={{
        position: "relative",
        width: scaledWidth,
        height: scaledHeight,
        backgroundColor,
        backgroundImage: backgroundImage
          ? `url(${backgroundImage})`
          : undefined,
        backgroundSize: "cover",
        border: "1px solid #ccc",
        margin: "20px auto",
        transformOrigin: "top left",
      }}
    >
      {positions.map((pos) => {
        const style: React.CSSProperties = {
          position: "absolute",
          left: pos.x * scale,
          top: pos.y * scale,
          width: pos.width * scale,
          height: pos.height * scale,
          border: pos.isOverlay ? "1px solid #007bff" : "1px dashed #aaa",
          backgroundColor: pos.isOverlay ? "transparent" : "#ccc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12 * scale,
          color: "#555",
          overflow: "hidden",
        };

        return (
          <div key={pos.id} style={style}>
            {pos.isOverlay && pos.src ? (
              <img
                src={pos.src}
                alt={pos.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              "Photo Placeholder"
            )}
          </div>
        );
      })}
    </div>
  );
}
