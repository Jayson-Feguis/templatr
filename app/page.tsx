"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, Download, RotateCcw } from "lucide-react";
import PhotoBoothSession from "@/components/photo-booth-session";
import TemplatePreview from "@/components/template-preview";
import ConfigPanel from "@/components/config-panel";
import type { PhotoBoothConfig, PhotoBoothTemplate } from "@/types/photo-booth";
import TemplateViewer from "@/components/template-viewer";
import { templates } from "@/lib/templates";

export default function Home() {
  const [config, setConfig] = useState<PhotoBoothConfig>({
    photoCount: 4,
    intervalSeconds: 10,
    templateId: "four-strip",
    customBackground: "",
    brandingType: "none",
    brandingText: "",
    brandingFont: "Sans Serif",
    brandingImage: "",
  });
  const [sessionActive, setSessionActive] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [showFinal, setShowFinal] = useState(false);

  const handleStartSession = () => {
    setCapturedPhotos([]);
    setShowFinal(false);
    setSessionActive(true);
  };

  const handleSessionComplete = (photos: string[]) => {
    setCapturedPhotos(photos);
    setSessionActive(false);
    setShowFinal(true);
  };

  const handleRestart = () => {
    setCapturedPhotos([]);
    setShowFinal(false);
    setSessionActive(false);
  };

  const handleDownload = () => {
    const canvas = document.getElementById(
      "final-template"
    ) as HTMLCanvasElement;
    if (canvas) {
      const link = document.createElement("a");
      link.download = `photo-booth-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Camera className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Photo Booth
              </h1>
              <p className="text-sm text-muted-foreground">
                Capture memories in style
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!sessionActive && !showFinal && (
          <div className="grid gap-8 lg:grid-cols-2">
            <Card className="p-6">
              <h2 className="mb-4 text-xl font-semibold text-foreground">
                Template Preview
              </h2>
              <TemplateViewer
                template={
                  templates.find(
                    (t) => t.id === config.templateId
                  ) as PhotoBoothTemplate
                }
              />
            </Card>

            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="mb-4 text-xl font-semibold text-foreground">
                  Configuration
                </h2>
                <ConfigPanel config={config} onConfigChange={setConfig} />
              </Card>

              <Button
                onClick={handleStartSession}
                size="lg"
                className="w-full text-lg"
              >
                <Camera className="mr-2 h-5 w-5" />
                Start Photo Booth
              </Button>
            </div>
          </div>
        )}

        {sessionActive && (
          <PhotoBoothSession
            config={config}
            onComplete={handleSessionComplete}
            onCancel={() => setSessionActive(false)}
          />
        )}

        {showFinal && capturedPhotos.length > 0 && (
          <div className="mx-auto max-w-2xl space-y-6">
            <Card className="p-6">
              <h2 className="mb-4 text-center text-2xl font-bold text-foreground">
                Your Photo Strip is Ready!
              </h2>
              <TemplatePreview
                photos={capturedPhotos}
                templateId={config.templateId}
                customBackground={config.customBackground}
                brandingConfig={{
                  brandingType: config.brandingType,
                  brandingText: config.brandingText,
                  brandingFont: config.brandingFont,
                  brandingImage: config.brandingImage,
                }}
              />
            </Card>

            <div className="flex gap-4">
              <Button
                onClick={handleRestart}
                variant="outline"
                size="lg"
                className="flex-1 bg-transparent"
              >
                <RotateCcw className="mr-2 h-5 w-5" />
                Take Another
              </Button>
              <Button onClick={handleDownload} size="lg" className="flex-1">
                <Download className="mr-2 h-5 w-5" />
                Download
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
