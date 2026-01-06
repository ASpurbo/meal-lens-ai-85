import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, Barcode, Image as ImageIcon, Check, Loader2, RotateCcw } from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { Camera as CapCamera, CameraResultType, CameraSource, CameraPermissionState } from "@capacitor/camera";
import { CameraPreview, CameraPreviewOptions } from "@capacitor-community/camera-preview";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";
import { CameraPermissionScreen } from "./CameraPermissionScreen";
interface NutritionData {
  foods: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: "low" | "medium" | "high";
  notes: string;
}

interface CameraInterfaceProps {
  open: boolean;
  onClose: () => void;
  onImageCapture: (base64: string) => Promise<NutritionData | null>;
  onBarcodeSelect: () => void;
  onManualSelect: () => void;
  onConfirmMeal: (data: NutritionData) => void;
  onDeclineMeal: (data: NutritionData) => void;
}

type Mode = "photo" | "barcode" | "manual";
type ViewState = "camera" | "analyzing" | "results";

export function CameraInterface({
  open,
  onClose,
  onImageCapture,
  onBarcodeSelect,
  onManualSelect,
  onConfirmMeal,
  onDeclineMeal,
}: CameraInterfaceProps) {
  const [mode, setMode] = useState<Mode>("photo");
  const [viewState, setViewState] = useState<ViewState>("camera");
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [showPermissionScreen, setShowPermissionScreen] = useState(false);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<NutritionData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { t } = useTranslation();

  // Check permission status on open
  const checkPermission = async (): Promise<"granted" | "denied" | "prompt"> => {
    if (Capacitor.isNativePlatform()) {
      try {
        const status = await CapCamera.checkPermissions();
        if (status.camera === "granted") return "granted";
        if (status.camera === "denied") return "denied";
        return "prompt";
      } catch {
        return "prompt";
      }
    } else {
      // Web: check using Permissions API
      try {
        const result = await navigator.permissions.query({ name: "camera" as PermissionName });
        if (result.state === "granted") return "granted";
        if (result.state === "denied") return "denied";
        return "prompt";
      } catch {
        return "prompt";
      }
    }
  };

  // Reset state when opened
  useEffect(() => {
    if (open) {
      setViewState("camera");
      setCapturedImage(null);
      setAnalysisResults(null);
      setShowPermissionScreen(false);
      setPermissionDenied(false);

      // Check permission first
      checkPermission().then((status) => {
        if (status === "granted") {
          startCamera();
        } else if (status === "denied") {
          setPermissionDenied(true);
          setShowPermissionScreen(true);
        } else {
          // Need to prompt
          setShowPermissionScreen(true);
        }
      });
    }

    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const setDocumentTransparent = (enabled: boolean) => {
    if (!Capacitor.isNativePlatform()) return;

    const html = document.documentElement;
    const body = document.body;

    if (enabled) {
      html.style.backgroundColor = "transparent";
      body.style.backgroundColor = "transparent";
    } else {
      html.style.backgroundColor = "";
      body.style.backgroundColor = "";
    }
  };

  const isStartingRef = useRef(false);

  const startCamera = async () => {
    if (isStartingRef.current) return;

    try {
      isStartingRef.current = true;

      if (Capacitor.isNativePlatform()) {
        // Avoid duplicate starts
        try {
          await CameraPreview.stop();
        } catch {
          // ignore
        }

        setDocumentTransparent(true);

        // Wait for layout so we can size the preview to the container
        await new Promise<void>((r) => requestAnimationFrame(() => r()));
        await new Promise<void>((r) => requestAnimationFrame(() => r()));

        const container = document.getElementById("cameraPreviewContainer");
        const rect = container?.getBoundingClientRect();

        const width = Math.round(rect?.width ?? window.innerWidth);
        const height = Math.round(rect?.height ?? window.innerHeight);
        const x = Math.round(rect?.left ?? 0);
        const y = Math.round(rect?.top ?? 0);

        // Ensure permissions are granted (some Android builds won't auto-prompt)
        try {
          await CapCamera.requestPermissions();
        } catch {
          // ignore; start() will still fail if denied
        }

        const cameraPreviewOptions: CameraPreviewOptions = {
          position: "rear",
          parent: "cameraPreviewContainer",
          toBack: true,
          x,
          y,
          width,
          height,
          disableAudio: true,
        };

        await CameraPreview.start(cameraPreviewOptions);
        setCameraStarted(true);
        setPermissionGranted(true);
      } else {
        // Web - use getUserMedia
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setCameraStarted(true);
        setPermissionGranted(true);
      }
    } catch (error) {
      console.error("Camera start error:", error);
      setPermissionGranted(false);
      toast.error("Could not access camera");
    } finally {
      isStartingRef.current = false;
    }
  };

  const stopCamera = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        await CameraPreview.stop();
      } catch {
        // ignore
      }
      setDocumentTransparent(false);
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setCameraStarted(false);
  };

  const captureFromWebStream = () => {
    if (!videoRef.current || !streamRef.current) return null;
    
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      return canvas.toDataURL("image/jpeg", 0.85);
    }
    return null;
  };

  const processImage = async (base64: string) => {
    setCapturedImage(base64);
    setViewState("analyzing");
    await stopCamera();

    try {
      const results = await onImageCapture(base64);
      if (results) {
        setAnalysisResults(results);
        setViewState("results");
      } else {
        // Analysis failed, go back to camera
        setViewState("camera");
        setCapturedImage(null);
        await startCamera();
      }
    } catch (error) {
      console.error("Analysis error:", error);
      setViewState("camera");
      setCapturedImage(null);
      await startCamera();
    }
  };

  const handleCapture = async () => {
    if (mode === "barcode") {
      await stopCamera();
      onClose();
      onBarcodeSelect();
      return;
    }
    
    if (mode === "manual") {
      await stopCamera();
      onClose();
      onManualSelect();
      return;
    }

    // Photo mode
    if (Capacitor.isNativePlatform() && cameraStarted) {
      try {
        const result = await CameraPreview.capture({ quality: 85 });
        if (result.value) {
          await processImage(`data:image/jpeg;base64,${result.value}`);
        }
      } catch (error) {
        console.error("Capture error:", error);
        toast.error("Could not capture photo");
      }
    } else if (streamRef.current && videoRef.current && videoRef.current.videoWidth > 0) {
      const base64 = captureFromWebStream();
      if (base64) {
        await processImage(base64);
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
          await processImage(`data:image/jpeg;base64,${photo.base64String}`);
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        await processImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleModeChange = async (newMode: Mode) => {
    setMode(newMode);
    if (newMode === "barcode") {
      await stopCamera();
      onClose();
      onBarcodeSelect();
    } else if (newMode === "manual") {
      await stopCamera();
      onClose();
      onManualSelect();
    }
  };

  const handleClose = async () => {
    await stopCamera();
    onClose();
  };

  const handleRetake = async () => {
    setCapturedImage(null);
    setAnalysisResults(null);
    setViewState("camera");
    await startCamera();
  };

  const handleConfirm = () => {
    if (analysisResults) {
      onConfirmMeal(analysisResults);
      handleClose();
    }
  };

  const handleDecline = () => {
    if (analysisResults) {
      onDeclineMeal(analysisResults);
      handleClose();
    }
  };

  const handleRequestPermission = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        const result = await CapCamera.requestPermissions();
        if (result.camera === "granted") {
          setShowPermissionScreen(false);
          setPermissionDenied(false);
          await startCamera();
        } else {
          setPermissionDenied(true);
        }
      } else {
        // Web: just try to start camera which will trigger the prompt
        setShowPermissionScreen(false);
        await startCamera();
      }
    } catch (error) {
      console.error("Permission request error:", error);
      setPermissionDenied(true);
    }
  };

  const handleOpenSettings = () => {
    // On native, we can't programmatically open settings, but we can inform the user
    toast.info("Please open your device Settings app and enable camera permission for NutriMind");
    handleClose();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex flex-col"
        style={{
          backgroundColor: viewState === "camera" && Capacitor.isNativePlatform() 
            ? "transparent" 
            : "hsl(var(--background))",
        }}
      >
        {/* Native camera preview container - renders behind WebView */}
        {viewState === "camera" && (
          <div id="cameraPreviewContainer" className="absolute inset-0" />
        )}

        {/* Web video preview */}
        {viewState === "camera" && !Capacitor.isNativePlatform() && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Captured image preview (analyzing/results states) */}
        {(viewState === "analyzing" || viewState === "results") && capturedImage && (
          <div className="absolute inset-0">
            <img 
              src={capturedImage} 
              alt="Captured" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60" />
          </div>
        )}

        {/* Camera Permission Screen */}
        {showPermissionScreen && (
          <CameraPermissionScreen
            onRequestPermission={handleRequestPermission}
            onOpenSettings={handleOpenSettings}
            onClose={handleClose}
            permissionDenied={permissionDenied}
          />
        )}

        {/* Overlay gradient (camera mode only) */}
        {viewState === "camera" && (
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none z-10" />
        )}

        {/* Header */}
        <div className="relative z-20 flex items-center justify-between px-4 py-4 pt-safe">
          <div className="w-10" />
          
          <div className="flex items-center gap-2">
            <span className="text-white text-lg font-semibold drop-shadow-lg">NutriMind</span>
          </div>
          
          <button 
            onClick={handleClose}
            className="w-10 h-10 rounded-full flex items-center justify-center"
          >
            <X className="w-6 h-6 text-white drop-shadow-lg" />
          </button>
        </div>

        {/* CAMERA VIEW */}
        {viewState === "camera" && (
          <>
            {/* Instruction text */}
            <div className="relative z-20 px-4 py-2 flex items-center justify-center gap-2 text-white/80 text-sm overflow-x-auto whitespace-nowrap">
              <Camera className="w-4 h-4 flex-shrink-0" />
              <span>{t.scan.takePhoto}</span>
              <span className="text-white/40">|</span>
              <Barcode className="w-4 h-4 flex-shrink-0" />
              <span>{t.scan.scanBarcode}</span>
            </div>

            {/* Camera viewfinder area */}
            <div className="flex-1 flex items-center justify-center px-6 relative z-20">
              <div className="relative w-full max-w-sm aspect-[3/4]">
                {/* Corner brackets */}
                <div className="absolute top-0 left-0 w-12 h-12 border-l-4 border-t-4 border-white/80 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-12 h-12 border-r-4 border-t-4 border-white/80 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-12 h-12 border-l-4 border-b-4 border-white/80 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-12 h-12 border-r-4 border-b-4 border-white/80 rounded-br-lg" />
              </div>
            </div>

            {/* Capture controls */}
            <div className="relative z-20 px-6 pb-4">
              <div className="flex items-center justify-center gap-8">
                {/* Gallery button */}
                <button
                  onClick={handleGallerySelect}
                  className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
                >
                  <ImageIcon className="w-5 h-5 text-white" />
                </button>

                {/* Capture button */}
                <button
                  onClick={handleCapture}
                  className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center"
                >
                  <div className="w-16 h-16 rounded-full bg-white" />
                </button>

                {/* Spacer for alignment */}
                <div className="w-12 h-12" />
              </div>
            </div>

            {/* Mode selector tabs */}
            <div className="relative z-20 px-6 pb-8 pb-safe">
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
          </>
        )}

        {/* ANALYZING VIEW */}
        {viewState === "analyzing" && (
          <div className="flex-1 flex flex-col items-center justify-center relative z-20 px-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-10 h-10 text-white animate-spin" />
              </div>
              <h2 className="text-white text-xl font-semibold mb-2">Analyzing your meal...</h2>
              <p className="text-white/70 text-sm">This may take a few seconds</p>
            </motion.div>
          </div>
        )}

        {/* RESULTS VIEW */}
        {viewState === "results" && analysisResults && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-safe"
          >
            {/* Results card */}
            <div className="bg-background/95 backdrop-blur-xl rounded-t-3xl p-6 space-y-4">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-foreground">Meal Detected</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Found {analysisResults.foods.length} food item(s)
                </p>
              </div>

              {/* Foods list */}
              <div className="bg-muted/50 rounded-xl p-3">
                <div className="flex flex-wrap gap-2">
                  {analysisResults.foods.map((food, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="text-sm text-foreground bg-background/80 px-3 py-1 rounded-full"
                    >
                      {food}
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* Nutrition overview */}
              <div className="grid grid-cols-4 gap-2">
                <div className="text-center p-2 bg-calories/10 rounded-xl">
                  <div className="text-base font-bold text-calories">{analysisResults.calories}</div>
                  <div className="text-xs text-muted-foreground">kcal</div>
                </div>
                <div className="text-center p-2 bg-protein/10 rounded-xl">
                  <div className="text-base font-bold text-protein">{analysisResults.protein}g</div>
                  <div className="text-xs text-muted-foreground">protein</div>
                </div>
                <div className="text-center p-2 bg-carbs/10 rounded-xl">
                  <div className="text-base font-bold text-carbs">{analysisResults.carbs}g</div>
                  <div className="text-xs text-muted-foreground">carbs</div>
                </div>
                <div className="text-center p-2 bg-fat/10 rounded-xl">
                  <div className="text-base font-bold text-fat">{analysisResults.fat}g</div>
                  <div className="text-xs text-muted-foreground">fat</div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleRetake}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-full border border-border text-foreground font-medium text-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  Retake
                </button>
                <button
                  onClick={handleDecline}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-full border border-border text-foreground font-medium text-sm"
                >
                  <X className="w-4 h-4" />
                  View
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-full bg-primary text-primary-foreground font-medium text-sm"
                >
                  <Check className="w-4 h-4" />
                  Add
                </button>
              </div>
            </div>
          </motion.div>
        )}

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
