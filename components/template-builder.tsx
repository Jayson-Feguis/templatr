"use client";

import { Rnd } from "react-rnd";
import { useEffect, useState } from "react";
import type { PhotoBoothTemplate, PhotoPosition } from "@/types/photo-booth";

const GUIDE_THRESHOLD = 1;
const MIN_CANVAS_SIZE = 300;

type MeasureLine = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
};

export function TemplateBuilder() {
  const [template, setTemplate] = useState<PhotoBoothTemplate>({
    id: "custom",
    name: "Custom Template",
    width: 600,
    height: 600,
    backgroundColor: "#ffffff",
    backgroundImage: "",
    isCustom: true,
    positions: [],
    description: "",
  });

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [clipboard, setClipboard] = useState<PhotoPosition | null>(null);
  const [guides, setGuides] = useState<{
    vertical: number[];
    horizontal: number[];
  }>({ vertical: [], horizontal: [] });
  const [spacing, setSpacing] = useState<{
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
  }>({});
  const [measureLines, setMeasureLines] = useState<MeasureLine[]>([]);

  /* ---------------- ADD ELEMENTS ---------------- */
  const addPhotoSlot = () => {
    setTemplate((prev) => ({
      ...prev,
      positions: [
        ...prev.positions,
        { id: crypto.randomUUID(), x: 100, y: 100, width: 250, height: 300 },
      ],
    }));
  };

  const addOverlayFromFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setTemplate((prev) => ({
        ...prev,
        positions: [
          ...prev.positions,
          {
            id: crypto.randomUUID(),
            x: 50,
            y: 50,
            width: 200,
            height: 200,
            isOverlay: true,
            src: reader.result as string,
            name: file.name,
          },
        ],
      }));
    };
    reader.readAsDataURL(file);
  };

  const uploadBackgroundImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = () =>
      setTemplate((prev) => ({
        ...prev,
        backgroundImage: reader.result as string,
      }));
    reader.readAsDataURL(file);
  };

  /* ---------------- UPDATE ---------------- */
  const updatePosition = (id: string, data: Partial<PhotoPosition>) => {
    setTemplate((prev) => ({
      ...prev,
      positions: prev.positions.map((p) =>
        p.id === id ? { ...p, ...data } : p
      ),
    }));
  };

  /* ---------------- GUIDES & MEASUREMENTS ---------------- */
  const calculateGuides = (moving: PhotoPosition) => {
    const vertical: number[] = [];
    const horizontal: number[] = [];
    const distances: typeof spacing = {};

    const m = {
      left: moving.x,
      right: moving.x + moving.width,
      centerX: moving.x + moving.width / 2,
      top: moving.y,
      bottom: moving.y + moving.height,
      centerY: moving.y + moving.height / 2,
    };

    // Canvas edges snapping
    if (Math.abs(m.left) < GUIDE_THRESHOLD) vertical.push(0);
    if (Math.abs(m.right - template.width) < GUIDE_THRESHOLD)
      vertical.push(template.width);
    if (Math.abs(m.centerX - template.width / 2) < GUIDE_THRESHOLD)
      vertical.push(template.width / 2);
    if (Math.abs(m.top) < GUIDE_THRESHOLD) horizontal.push(0);
    if (Math.abs(m.bottom - template.height) < GUIDE_THRESHOLD)
      horizontal.push(template.height);
    if (Math.abs(m.centerY - template.height / 2) < GUIDE_THRESHOLD)
      horizontal.push(template.height / 2);

    distances.left = Math.round(m.left);
    distances.right = Math.round(template.width - m.right);
    distances.top = Math.round(m.top);
    distances.bottom = Math.round(template.height - m.bottom);

    // Object-to-object snapping
    template.positions.forEach((o) => {
      if (o.id === moving.id) return;
      const ox = [o.x, o.x + o.width, o.x + o.width / 2];
      const oy = [o.y, o.y + o.height, o.y + o.height / 2];

      ox.forEach((x) => {
        if (Math.abs(m.left - x) < GUIDE_THRESHOLD) vertical.push(x);
        if (Math.abs(m.right - x) < GUIDE_THRESHOLD) vertical.push(x);
        if (Math.abs(m.centerX - x) < GUIDE_THRESHOLD) vertical.push(x);
      });

      oy.forEach((y) => {
        if (Math.abs(m.top - y) < GUIDE_THRESHOLD) horizontal.push(y);
        if (Math.abs(m.bottom - y) < GUIDE_THRESHOLD) horizontal.push(y);
        if (Math.abs(m.centerY - y) < GUIDE_THRESHOLD) horizontal.push(y);
      });
    });

    setGuides({ vertical, horizontal });
    setSpacing(distances);

    // Calculate measurement lines to canvas or nearby objects
    const lines: MeasureLine[] = [];

    let closestLeft = { dist: m.left, refX: 0 };
    let closestRight = { dist: template.width - m.right, refX: template.width };
    let closestTop = { dist: m.top, refY: 0 };
    let closestBottom = {
      dist: template.height - m.bottom,
      refY: template.height,
    };

    template.positions.forEach((o) => {
      if (o.id === moving.id) return;
      if (o.x + o.width <= m.left) {
        const d = m.left - (o.x + o.width);
        if (d < closestLeft.dist)
          closestLeft = { dist: d, refX: o.x + o.width };
      }
      if (o.x >= m.right) {
        const d = o.x - m.right;
        if (d < closestRight.dist) closestRight = { dist: d, refX: o.x };
      }
      if (o.y + o.height <= m.top) {
        const d = m.top - (o.y + o.height);
        if (d < closestTop.dist) closestTop = { dist: d, refY: o.y + o.height };
      }
      if (o.y >= m.bottom) {
        const d = o.y - m.bottom;
        if (d < closestBottom.dist) closestBottom = { dist: d, refY: o.y };
      }
    });

    if (closestLeft.dist > 0)
      lines.push({
        x1: closestLeft.refX,
        y1: m.centerY,
        x2: m.left,
        y2: m.centerY,
        label: `${Math.round(closestLeft.dist)}px`,
      });
    if (closestRight.dist > 0)
      lines.push({
        x1: m.right,
        y1: m.centerY,
        x2: closestRight.refX,
        y2: m.centerY,
        label: `${Math.round(closestRight.dist)}px`,
      });
    if (closestTop.dist > 0)
      lines.push({
        x1: m.centerX,
        y1: closestTop.refY,
        x2: m.centerX,
        y2: m.top,
        label: `${Math.round(closestTop.dist)}px`,
      });
    if (closestBottom.dist > 0)
      lines.push({
        x1: m.centerX,
        y1: m.bottom,
        x2: m.centerX,
        y2: closestBottom.refY,
        label: `${Math.round(closestBottom.dist)}px`,
      });

    setMeasureLines(lines);
  };

  const clearHelpers = () => {
    setGuides({ vertical: [], horizontal: [] });
    setSpacing({});
    setMeasureLines([]);
  };

  /* ---------------- COPY / PASTE / DELETE ---------------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!selectedId) return;
      const current = template.positions.find((p) => p.id === selectedId);
      if (!current) return;

      if (e.key === "Delete") {
        setTemplate((prev) => ({
          ...prev,
          positions: prev.positions.filter((p) => p.id !== selectedId),
        }));
        setSelectedId(null);
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "c")
        setClipboard({ ...current });
      if ((e.ctrlKey || e.metaKey) && e.key === "v" && clipboard) {
        setTemplate((prev) => ({
          ...prev,
          positions: [
            ...prev.positions,
            {
              ...clipboard,
              id: crypto.randomUUID(),
              x: clipboard.x + 20,
              y: clipboard.y + 20,
            },
          ],
        }));
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, clipboard, template.positions]);

  /* ---------------- UI ---------------- */
  return (
    <div className="flex gap-10 p-10">
      {/* CONTROLS */}
      <div className="flex flex-col gap-3 w-56">
        <button
          onClick={addPhotoSlot}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Photo Slot
        </button>

        <label className="bg-green-600 text-white px-4 py-2 rounded cursor-pointer">
          Add Overlay
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) =>
              e.target.files && addOverlayFromFile(e.target.files[0])
            }
          />
        </label>

        <label className="bg-purple-600 text-white px-4 py-2 rounded cursor-pointer">
          Upload Background
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) =>
              e.target.files && uploadBackgroundImage(e.target.files[0])
            }
          />
        </label>

        {/* Canvas inputs */}
        <div className="flex gap-2 items-center text-sm">
          <label className="w-16">Width</label>
          <input
            type="number"
            min={MIN_CANVAS_SIZE}
            value={template.width}
            onChange={(e) =>
              setTemplate((p) => ({ ...p, width: +e.target.value }))
            }
            className="border px-2 py-1 w-24"
          />
        </div>
        <div className="flex gap-2 items-center text-sm">
          <label className="w-16">Height</label>
          <input
            type="number"
            min={MIN_CANVAS_SIZE}
            value={template.height}
            onChange={(e) =>
              setTemplate((p) => ({ ...p, height: +e.target.value }))
            }
            className="border px-2 py-1 w-24"
          />
        </div>
      </div>

      <div className="flex flex-col">
        {/* CANVAS */}
        <div className="relative">
          {/* Resizable canvas */}
          <Rnd
            size={{ width: template.width, height: template.height }}
            position={{ x: 0, y: 0 }}
            disableDragging
            minWidth={MIN_CANVAS_SIZE}
            minHeight={MIN_CANVAS_SIZE}
            enableResizing={{ bottomRight: true }}
            onResizeStop={(_, __, ref) =>
              setTemplate((p) => ({
                ...p,
                width: ref.offsetWidth,
                height: ref.offsetHeight,
              }))
            }
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                backgroundImage: template.backgroundImage
                  ? `url(${template.backgroundImage})`
                  : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
                position: "relative",
                border: "2px dashed #ccc",
              }}
            >
              {/* Guides */}
              {guides.vertical.map((x, i) => (
                <div
                  key={`v-${i}`}
                  style={{
                    position: "absolute",
                    left: x,
                    top: 0,
                    width: 1,
                    height: "100%",
                    background: "red",
                  }}
                />
              ))}
              {guides.horizontal.map((y, i) => (
                <div
                  key={`h-${i}`}
                  style={{
                    position: "absolute",
                    top: y,
                    left: 0,
                    height: 1,
                    width: "100%",
                    background: "red",
                  }}
                />
              ))}

              {/* Measurement lines */}
              {measureLines.map((l, i) => (
                <div key={i}>
                  <div
                    style={{
                      position: "absolute",
                      left: Math.min(l.x1, l.x2),
                      top: Math.min(l.y1, l.y2),
                      width: Math.abs(l.x2 - l.x1) || 1,
                      height: Math.abs(l.y2 - l.y1) || 1,
                      borderTop:
                        l.y1 === l.y2 ? "1px dashed #16a34a" : undefined,
                      borderLeft:
                        l.x1 === l.x2 ? "1px dashed #16a34a" : undefined,
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      left: (l.x1 + l.x2) / 2,
                      top: (l.y1 + l.y2) / 2,
                      transform: "translate(-50%, -50%)",
                      fontSize: 10,
                      background: "#16a34a",
                      color: "white",
                      padding: "2px 4px",
                      borderRadius: 4,
                      pointerEvents: "none",
                    }}
                  >
                    {l.label}
                  </div>
                </div>
              ))}

              {/* Elements */}
              {template.positions.map((pos) => (
                <Rnd
                  key={pos.id}
                  size={{ width: pos.width, height: pos.height }}
                  position={{ x: pos.x, y: pos.y }}
                  bounds="parent"
                  onMouseDown={() => setSelectedId(pos.id)}
                  onMouseEnter={() => setHoveredId(pos.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onDrag={(_, d) => calculateGuides({ ...pos, x: d.x, y: d.y })}
                  onResize={(_, __, ref, ___, p) =>
                    calculateGuides({
                      ...pos,
                      width: ref.offsetWidth,
                      height: ref.offsetHeight,
                      x: p.x,
                      y: p.y,
                    })
                  }
                  onDragStop={(_, d) => {
                    updatePosition(pos.id, { x: d.x, y: d.y });
                    clearHelpers();
                  }}
                  onResizeStop={(_, __, ref, ___, p) => {
                    updatePosition(pos.id, {
                      width: ref.offsetWidth,
                      height: ref.offsetHeight,
                      x: p.x,
                      y: p.y,
                    });
                    clearHelpers();
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      border:
                        selectedId === pos.id
                          ? "2px solid #2563eb"
                          : hoveredId === pos.id
                          ? "2px dashed #60a5fa"
                          : "2px solid transparent",
                    }}
                  >
                    {pos.isOverlay && pos.src ? (
                      <img
                        src={pos.src}
                        draggable={false}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          pointerEvents: "none",
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-100 font-semibold">
                        Photo
                      </div>
                    )}
                  </div>
                </Rnd>
              ))}
            </div>
          </Rnd>

          {/* Edge spacing */}
          {selectedId && (
            <div className="mt-2 text-xs text-gray-600 flex gap-4">
              {spacing.left !== undefined && <>← {spacing.left}px</>}
              {spacing.right !== undefined && <>→ {spacing.right}px</>}
              {spacing.top !== undefined && <>↑ {spacing.top}px</>}
              {spacing.bottom !== undefined && <>↓ {spacing.bottom}px</>}
            </div>
          )}
        </div>
        <pre style={{ marginTop: template.height }}>
          {JSON.stringify(template, null, 2)}
        </pre>
      </div>
    </div>
  );
}
