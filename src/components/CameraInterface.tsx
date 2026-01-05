import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Info, Camera, Barcode, PenLine, Image, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Camera as CapCamera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Capacitor } from "@capacitor/core";
import { useTranslation } from "@/hooks/useTranslation";
import { useNavigate } from "react-router-dom";

interface CameraInterfaceProps {
  onImageSelect: (base64: string) => void;
  onBarcodeClick: () => void;
  onManualClick: () => void;
  isAnalyzing: boolean;
  activeMethod: "camera" | "barcode" | "manual";
  setActiveMethod: (method: "camera" | "barcode" | "manual") => void;
}

export function CameraInterface({ 
  onImageSelect, 
  onBarcodeClick, 
  onManualClick, 
  isAnalyzing,
  activeMethod,
  setActiveMethod
}: CameraInterfaceProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();
  const navigate = useNavigate();

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

  const handleCameraCapture = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        const image = await CapCamera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.Base64,
          source: CameraSource.Camera,
          saveToGallery: false,
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
    if (Capacitor.isNativePlatform()) {
      try {
        const image = await CapCamera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.Base64,
          source: CameraSource.Photos,
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
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const clearImage = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-[#1a0a0a] via-[#2d1010] to-[#1a0808] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-12 pb-4">
        <button 
          className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center"
          onClick={() => {}}
        >
          <Info className="w-5 h-5 text-white/70" />
        </button>
        
        <div className="flex items-center gap-2">
          <span className="text-2xl">🍎</span>
          <span className="text-white text-xl font-semibold tracking-wide">Calz</span>
        </div>
        
        <button 
          className="w-10 h-10 rounded-full flex items-center justify-center"
          onClick={() => navigate("/")}
        >
          <X className="w-6 h-6 text-white/70" />
        </button>
      </div>

      {/* Instruction Text */}
      <div className="px-4 py-2 overflow-x-auto whitespace-nowrap">
        <p className="text-white/60 text-sm flex items-center gap-2 justify-center">
          <span>{t.scan.takePhotoShort || "nehmen Sie ein"}</span>
          <Camera className="w-4 h-4 inline text-white/80" />
          <span className="text-white font-medium">Foto</span>
          <span>{t.scan.orScan || "oder scannen Sie einen"}</span>
          <Barcode className="w-4 h-4 inline text-white/80" />
          <span className="text-white/60">Barcode</span>
        </p>
      </div>

      {/* Camera View Area */}
      <div className="flex-1 relative mx-4 my-6">
        <AnimatePresence mode="wait">
          {preview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 rounded-3xl overflow-hidden"
            >
              <img
                src={preview}
                alt="Meal preview"
                className="w-full h-full object-cover"
              />
              {isAnalyzing && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 animate-spin text-white" />
                    <span className="text-white font-medium">Analyzing...</span>
                  </div>
                </div>
              )}
              {!isAnalyzing && (
                <button
                  onClick={clearImage}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/20 backdrop-blur-sm"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="viewfinder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {/* Corner Brackets */}
              <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-white/50 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-16 h-16 border-r-2 border-t-2 border-white/50 rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-16 h-16 border-l-2 border-b-2 border-white/50 rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-white/50 rounded-br-lg" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Gallery Button & Capture Button */}
        {!preview && (
          <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-8">
            <button 
              onClick={handleGallerySelect}
              className="w-12 h-12 rounded-full bg-black/60 border border-white/30 flex items-center justify-center"
            >
              <Image className="w-5 h-5 text-white" />
            </button>
            
            <button 
              onClick={handleCameraCapture}
              className="w-20 h-20 rounded-full border-4 border-white/80 flex items-center justify-center"
            >
              <div className="w-16 h-16 rounded-full bg-white/90" />
            </button>
            
            <div className="w-12" /> {/* Spacer for balance */}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="pb-8 pt-4 px-4">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => {
              setActiveMethod("manual");
              onManualClick();
            }}
            className={cn(
              "px-4 py-2 text-xs font-medium tracking-wider uppercase transition-all",
              activeMethod === "manual" 
                ? "text-white bg-white/20 rounded-full" 
                : "text-white/50"
            )}
          >
            {t.scan.manualEntry}
          </button>
          
          <button
            onClick={() => setActiveMethod("camera")}
            className={cn(
              "px-5 py-2 text-xs font-medium tracking-wider uppercase transition-all",
              activeMethod === "camera" 
                ? "text-black bg-white rounded-full" 
                : "text-white/50"
            )}
          >
            Foto
          </button>
          
          <button
            onClick={() => {
              setActiveMethod("barcode");
              onBarcodeClick();
            }}
            className={cn(
              "px-4 py-2 text-xs font-medium tracking-wider uppercase transition-all",
              activeMethod === "barcode" 
                ? "text-white bg-white/20 rounded-full" 
                : "text-white/50"
            )}
          >
            {t.scan.manualEntryShort}
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}