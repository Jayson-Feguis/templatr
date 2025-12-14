"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import type { PhotoBoothConfig } from "@/types/photo-booth";

interface PhotoBoothSessionProps {
  config: PhotoBoothConfig;
  onComplete: (photos: string[]) => void;
  onCancel: () => void;
}

export default function PhotoBoothSession({
  config,
  onComplete,
  onCancel,
}: PhotoBoothSessionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [countdown, setCountdown] = useState(config.intervalSeconds);
  const [photos, setPhotos] = useState<string[]>([]);
  const [showFlash, setShowFlash] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("[v0] Camera error:", err);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (currentPhoto >= config.photoCount) {
      onComplete(photos);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          capturePhoto();
          return config.intervalSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPhoto, countdown]);

  function capturePhoto() {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const photoDataUrl = canvas.toDataURL("image/png");

    setPhotos((prev) => [...prev, photoDataUrl]);
    setCurrentPhoto((prev) => prev + 1);
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 200);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Card className="relative overflow-hidden p-6">
        <Button
          onClick={onCancel}
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 z-10"
        >
          <X className="h-5 w-5" />
        </Button>

        <div className="mb-4 text-center">
          <h2 className="text-2xl font-bold text-foreground">
            Photo {currentPhoto + 1} of {config.photoCount}
          </h2>
          <p className="text-muted-foreground">Get ready!</p>
        </div>

        <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover"
          />

          {showFlash && (
            <div className="absolute inset-0 animate-flash bg-white" />
          )}

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-48 w-48 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm">
              <span className="text-9xl font-bold text-white">{countdown}</span>
            </div>
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />

        <div className="mt-6 flex gap-2">
          {Array.from({ length: config.photoCount }).map((_, index) => (
            <div
              key={index}
              className={`h-2 flex-1 rounded-full ${
                index < currentPhoto
                  ? "bg-primary"
                  : index === currentPhoto
                  ? "bg-primary/50"
                  : "bg-muted-foreground/20"
              }`}
            />
          ))}
        </div>
      </Card>
    </div>
  );
}
