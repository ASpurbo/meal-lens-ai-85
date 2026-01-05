import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, Barcode, PenLine, Image as ImageIcon } from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { Camera as CapCamera, CameraResultType, CameraSource } from "@capacitor/camera";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";

interface CameraInterfaceProps {
  open: boolean;
  onClose: () => void;
  onImageCapture: (base64: string) => void;
  onBarcodeSelect: () => void;
  onManualSelect: () => void;
}

type Mode = "photo" | "barcode" | "manual";

export function CameraInterface({
  open,
  onClose,
  onImageCapture,
  onBarcodeSelect,
  onManualSelect,
}: CameraInterfaceProps) {
  const [mode, setMode] = useState<Mode>("photo");
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { t } = useTranslation();

  // Request camera permission and start stream when opened
  useEffect(() => {
    if (open) {
      requestCameraPermission();
    }
    return () => {
      stopCameraStream();
    };
  }, [open]);

  const requestCameraPermission = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        // Request permission on native platforms
        const permission = await CapCamera.requestPermissions();
        if (permission.camera === 'granted') {
          setPermissionGranted(true);
          // Start native camera stream using getUserMedia (works on Android WebView)
          await startCameraStream();
        } else {
          setPermissionGranted(false);
          toast.error("Camera permission is required to scan food");
        }
      } else {
        // Web - just start the stream (will prompt for permission)
        await startCameraStream();
        setPermissionGranted(true);
      }
    } catch (error) {
      console.error("Permission error:", error);
      setPermissionGranted(false);
      toast.error("Could not access camera");
    }
  };

  const startCameraStream = async () => {
    try {
      // Use getUserMedia for both web and native (works in Android WebView)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (error) {
      console.error("Camera stream error:", error);
      // On native, fall back to native camera capture
      if (Capacitor.isNativePlatform()) {
        console.log("Falling back to native camera capture");
      }
    }
  };

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const captureFromStream = () => {
    if (!videoRef.current || !streamRef.current) return;
    
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const base64 = canvas.toDataURL("image/jpeg", 0.85);
      stopCameraStream();
      onClose();
      onImageCapture(base64);
    }
  };

  const handleCapture = async () => {
    if (mode === "barcode") {
      stopCameraStream();
      onClose();
      onBarcodeSelect();
      return;
    }
    
    if (mode === "manual") {
      stopCameraStream();
      onClose();
      onManualSelect();
      return;
    }

    // Photo mode - try to capture from stream first (works on both web and native)
    if (streamRef.current && videoRef.current && videoRef.current.videoWidth > 0) {
      captureFromStream();
      return;
    }

    // Fallback to native camera API if stream not available
    if (Capacitor.isNativePlatform()) {
      try {
        const photo = await CapCamera.getPhoto({
          quality: 85,
          allowEditing: false,
          resultType: CameraResultType.Base64,
          source: CameraSource.Camera,
          saveToGallery: false,
        });

        if (photo.base64String) {
          stopCameraStream();
          onClose();
          onImageCapture(`data:image/jpeg;base64,${photo.base64String}`);
        }
      } catch (error) {
        console.error("Camera error:", error);
        toast.error("Could not capture photo");
      }
    }
  };

  const handleGallerySelect = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        const photo = await CapCamera.getPhoto({
          quality: 85,
          allowEditing: false,
          resultType: CameraResultType.Base64,
          source: CameraSource.Photos,
          saveToGallery: false,
        });

        if (photo.base64String) {
          stopCameraStream();
          onClose();
          onImageCapture(`data:image/jpeg;base64,${photo.base64String}`);
        }
      } catch (error) {
        console.error("Gallery error:", error);
      }
    } else {
      if (fileInputRef.current) {
        fileInputRef.current.removeAttribute("capture");
        fileInputRef.current.click();
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        stopCameraStream();
        onClose();
        onImageCapture(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    if (newMode === "barcode") {
      stopCameraStream();
      onClose();
      onBarcodeSelect();
    } else if (newMode === "manual") {
      stopCameraStream();
      onClose();
      onManualSelect();
    }
  };

  const handleClose = () => {
    stopCameraStream();
    onClose();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-gradient-to-b from-[hsl(350,30%,12%)] to-[hsl(350,40%,8%)] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 pt-safe">
          <div className="w-10" />
          
          <div className="flex items-center gap-2">
            <span className="text-background text-lg font-semibold">NutriMind</span>
          </div>
          
          <button 
            onClick={handleClose}
            className="w-10 h-10 rounded-full flex items-center justify-center"
          >
            <X className="w-6 h-6 text-background" />
          </button>
        </div>

        {/* Instruction text */}
        <div className="px-4 py-2 flex items-center justify-center gap-2 text-background/70 text-sm overflow-x-auto whitespace-nowrap">
          <Camera className="w-4 h-4 flex-shrink-0" />
          <span>{t.scan.takePhoto}</span>
          <span className="text-background/40">|</span>
          <Barcode className="w-4 h-4 flex-shrink-0" />
          <span>{t.scan.scanBarcode}</span>
        </div>

        {/* Camera viewfinder area */}
        <div className="flex-1 flex items-center justify-center px-6 relative overflow-hidden">
          {/* Live camera preview - works on both web and native */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />
          
          {/* Permission denied message */}
          {permissionGranted === false && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
              <div className="text-center p-6">
                <Camera className="w-12 h-12 text-white/50 mx-auto mb-4" />
                <p className="text-white/80 mb-2">Camera access required</p>
                <p className="text-white/50 text-sm">Please grant camera permission in your device settings</p>
              </div>
            </div>
          )}
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(350,30%,12%)]/60 via-transparent to-[hsl(350,40%,8%)]/80 pointer-events-none" />
          
          <div className="relative w-full max-w-sm aspect-[3/4] z-10">
            {/* Corner brackets */}
            <div className="absolute top-0 left-0 w-12 h-12 border-l-4 border-t-4 border-background/80 rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-12 h-12 border-r-4 border-t-4 border-background/80 rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-12 h-12 border-l-4 border-b-4 border-background/80 rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-12 h-12 border-r-4 border-b-4 border-background/80 rounded-br-lg" />
          </div>
        </div>

        {/* Capture controls */}
        <div className="px-6 pb-4 relative z-20">
          <div className="flex items-center justify-center gap-8">
            {/* Gallery button */}
            <button
              onClick={handleGallerySelect}
              className="w-12 h-12 rounded-full bg-foreground flex items-center justify-center"
            >
              <ImageIcon className="w-5 h-5 text-background" />
            </button>

            {/* Capture button */}
            <button
              onClick={handleCapture}
              className="w-20 h-20 rounded-full border-4 border-background flex items-center justify-center"
            >
              <div className="w-16 h-16 rounded-full bg-background" />
            </button>

            {/* Spacer for alignment */}
            <div className="w-12 h-12" />
          </div>
        </div>

        {/* Mode selector tabs - fixed order */}
        <div className="px-6 pb-8 pb-safe relative z-20">
          <div className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm rounded-full p-1">
            <button
              onClick={() => handleModeChange("manual")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                mode === "manual"
                  ? "bg-white text-black"
                  : "text-white/80 hover:text-white"
              }`}
            >
              {t.scan.manualEntry}
            </button>
            <button
              onClick={() => setMode("photo")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                mode === "photo"
                  ? "bg-white text-black"
                  : "text-white/80 hover:text-white"
              }`}
            >
              {t.scan.takePhoto}
            </button>
            <button
              onClick={() => handleModeChange("barcode")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                mode === "barcode"
                  ? "bg-white text-black"
                  : "text-white/80 hover:text-white"
              }`}
            >
              {t.scan.scanBarcode}
            </button>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </motion.div>
    </AnimatePresence>
  );
}