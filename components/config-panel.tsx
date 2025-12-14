"use client";

import type React from "react";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { templates } from "@/lib/templates";
import type { PhotoBoothConfig } from "@/types/photo-booth";
import { Upload, X } from "lucide-react";
import { useRef } from "react";
import Image from "next/image";

interface ConfigPanelProps {
  config: PhotoBoothConfig;
  onConfigChange: (config: PhotoBoothConfig) => void;
}

export default function ConfigPanel({
  config,
  onConfigChange,
}: ConfigPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        onConfigChange({ ...config, customBackground: imageUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBackground = () => {
    onConfigChange({ ...config, customBackground: undefined });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        onConfigChange({ ...config, brandingImage: imageUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    onConfigChange({ ...config, brandingImage: undefined });
    if (logoInputRef.current) {
      logoInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="template">Template</Label>
        <select
          id="template"
          value={config.templateId}
          onChange={(e) =>
            onConfigChange({ ...config, templateId: e.target.value })
          }
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="background">Custom Background</Label>
        <div className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            id="background"
            accept="image/*"
            onChange={handleBackgroundUpload}
            className="hidden"
          />

          {!config.customBackground ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Background Image
            </Button>
          ) : (
            <div className="space-y-2">
              <div className="relative overflow-hidden rounded-md border border-border">
                <Image
                  src={config.customBackground || "/placeholder.svg"}
                  alt="Custom background"
                  className="h-32 w-full object-cover"
                  height={128}
                  width={100}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleRemoveBackground}
                className="w-full bg-transparent"
              >
                <X className="mr-2 h-4 w-4" />
                Remove Background
              </Button>
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Upload an image to use as background behind photos
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="photoCount">Number of Photos</Label>
        <Input
          id="photoCount"
          type="number"
          min="1"
          max="10"
          value={config.photoCount}
          onChange={(e) =>
            onConfigChange({
              ...config,
              photoCount: Number.parseInt(e.target.value) || 4,
            })
          }
        />
        <p className="text-xs text-muted-foreground">
          How many photos to capture (1-10)
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="intervalSeconds">Countdown Timer (seconds)</Label>
        <Input
          id="intervalSeconds"
          type="number"
          min="3"
          max="30"
          value={config.intervalSeconds}
          onChange={(e) =>
            onConfigChange({
              ...config,
              intervalSeconds: Number.parseInt(e.target.value) || 10,
            })
          }
        />
        <p className="text-xs text-muted-foreground">
          Time between each photo (3-30 seconds)
        </p>
      </div>

      <div className="space-y-4 rounded-lg border border-border bg-card p-4">
        <h3 className="font-semibold text-foreground">Photo Booth Branding</h3>

        <div className="space-y-2">
          <Label htmlFor="brandingType">Branding Type</Label>
          <select
            id="brandingType"
            value={config.brandingType}
            onChange={(e) =>
              onConfigChange({
                ...config,
                brandingType: e.target.value as "text" | "image" | "none",
              })
            }
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="none">No Branding</option>
            <option value="text">Text Name</option>
            <option value="image">Logo Image</option>
          </select>
        </div>

        {config.brandingType === "text" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="brandingText">Event Name</Label>
              <Input
                id="brandingText"
                type="text"
                placeholder="e.g., Sarah & John's Wedding"
                value={config.brandingText || ""}
                onChange={(e) =>
                  onConfigChange({ ...config, brandingText: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                Custom text to display on photo strip
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="brandingFont">Font Style</Label>
              <select
                id="brandingFont"
                value={config.brandingFont || "Sans Serif"}
                onChange={(e) =>
                  onConfigChange({ ...config, brandingFont: e.target.value })
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="Sans Serif">Sans Serif (Clean & Modern)</option>
                <option value="Serif">Serif (Classic & Elegant)</option>
                <option value="Script">Script (Romantic & Flowing)</option>
                <option value="Monospace">Monospace (Tech & Retro)</option>
              </select>
            </div>
          </>
        )}

        {config.brandingType === "image" && (
          <div className="space-y-2">
            <Label htmlFor="brandingLogo">Logo Image</Label>
            <div className="space-y-3">
              <input
                ref={logoInputRef}
                type="file"
                id="brandingLogo"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />

              {!config.brandingImage ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => logoInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Logo Image
                </Button>
              ) : (
                <div className="space-y-2">
                  <div className="relative overflow-hidden rounded-md border border-border bg-muted">
                    <Image
                      src={config.brandingImage || "/placeholder.svg"}
                      alt="Branding logo"
                      className="h-32 w-full object-contain p-4"
                      height={128}
                      width={100}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRemoveLogo}
                    className="w-full bg-transparent"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Remove Logo
                  </Button>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Upload a logo or custom graphic for your event
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
