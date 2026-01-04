import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Camera, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Camera as CapCamera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Capacitor } from "@capacitor/core";

interface ImageUploadProps {
  onImageSelect: (base64: string) => void;
  isAnalyzing: boolean;
}

export function ImageUpload({ onImageSelect, isAnalyzing }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setPreview(base64);
      onImageSelect(base64);
    };
    reader.readAsDataURL(file);
  }, [onImageSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleCameraCapture = async () => {
    // Use Capacitor Camera on native platforms for better control
    if (Capacitor.isNativePlatform()) {
      try {
        const image = await CapCamera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.Base64,
          source: CameraSource.Camera, // Forces camera, not gallery
          saveToGallery: false, // Don't save to phone gallery
          correctOrientation: true,
        });

        if (image.base64String) {
          const base64 = `data:image/${image.format};base64,${image.base64String}`;
          setPreview(base64);
          onImageSelect(base64);
        }
      } catch (error) {
        console.log("Camera cancelled or error:", error);
      }
    } else {
      // Fallback for web: use file input with capture
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.capture = "environment";
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) processFile(file);
      };
      input.click();
    }
  };

  const handleGallerySelect = async () => {
    // Use Capacitor Camera for gallery on native platforms
    if (Capacitor.isNativePlatform()) {
      try {
        const image = await CapCamera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.Base64,
          source: CameraSource.Photos, // Opens gallery directly
          correctOrientation: true,
        });

        if (image.base64String) {
          const base64 = `data:image/${image.format};base64,${image.base64String}`;
          setPreview(base64);
          onImageSelect(base64);
        }
      } catch (error) {
        console.log("Gallery selection cancelled or error:", error);
      }
    } else {
      // Fallback for web
      fileInputRef.current?.click();
    }
  };

  const clearImage = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="relative rounded-2xl overflow-hidden border border-border"
          >
            <img
              src={preview}
              alt="Meal preview"
              className="w-full aspect-square object-cover"
            />
            {isAnalyzing && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-foreground" />
                  <span className="text-sm font-medium">Analyzing...</span>
                </div>
              </div>
            )}
            {!isAnalyzing && (
              <button
                onClick={clearImage}
                className="absolute top-3 right-3 p-2 rounded-full bg-foreground text-background hover:bg-foreground/90 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={cn(
              "relative border-2 border-dashed rounded-2xl p-12 transition-all duration-200 cursor-pointer",
              isDragging
                ? "border-foreground bg-accent"
                : "border-border hover:border-foreground/50"
            )}
            onClick={handleGallerySelect}
          >
            <div className="flex flex-col items-center gap-4 text-center">
              <div className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center transition-colors",
                isDragging ? "bg-foreground text-background" : "bg-accent"
              )}>
                {isDragging ? (
                  <Upload className="w-6 h-6" />
                ) : (
                  <Camera className="w-6 h-6" />
                )}
              </div>
              
              <div>
                <p className="text-base font-medium">
                  {isDragging ? "Drop here" : "Scan your meal"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Take a photo or upload an image
                </p>
              </div>

              <div className="flex gap-3 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGallerySelect();
                  }}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </Button>
                <Button
                  size="sm"
                  className="rounded-xl"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCameraCapture();
                  }}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Camera
                </Button>
              </div>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
