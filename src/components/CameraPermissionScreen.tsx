import { Camera, Settings, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Capacitor } from "@capacitor/core";

interface CameraPermissionScreenProps {
  onRequestPermission: () => void;
  onOpenSettings: () => void;
  onClose: () => void;
  permissionDenied: boolean;
}

export function CameraPermissionScreen({
  onRequestPermission,
  onOpenSettings,
  onClose,
  permissionDenied,
}: CameraPermissionScreenProps) {
  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted/50 px-6">
      <div className="max-w-sm w-full text-center space-y-6">
        {/* Icon */}
        <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <Camera className="w-10 h-10 text-primary" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">
            {permissionDenied ? "Camera Access Needed" : "Enable Camera"}
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {permissionDenied
              ? "Camera permission was denied. Please enable it in your device settings to scan meals."
              : "NutriMind needs camera access to scan and analyze your meals for nutrition tracking."}
          </p>
        </div>

        {/* Features list */}
        <div className="bg-card rounded-xl p-4 space-y-3 text-left border border-border">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Camera className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Photo Analysis</p>
              <p className="text-xs text-muted-foreground">
                Take photos of meals for instant nutrition info
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Private & Secure</p>
              <p className="text-xs text-muted-foreground">
                Photos are analyzed securely and never stored
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          {permissionDenied ? (
            <>
              <Button onClick={onOpenSettings} className="w-full" size="lg">
                <Settings className="w-4 h-4 mr-2" />
                Open Settings
              </Button>
              <Button onClick={onClose} variant="ghost" className="w-full">
                Maybe Later
              </Button>
            </>
          ) : (
            <>
              <Button onClick={onRequestPermission} className="w-full" size="lg">
                <Camera className="w-4 h-4 mr-2" />
                Allow Camera Access
              </Button>
              <Button onClick={onClose} variant="ghost" className="w-full">
                Not Now
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
