import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Moon, Sun, Lock, Trash2, LogOut, Camera, 
  ChevronRight, AlertTriangle, Loader2, ChefHat, ArrowLeft,
  Ruler, Scale, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { differenceInYears, format, parseISO } from "date-fns";

export default function Settings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editField, setEditField] = useState<"height" | "weight" | null>(null);
  const [editValue, setEditValue] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isRemovingAvatar, setIsRemovingAvatar] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Fetch user profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Calculate age from birthday
  const calculateAge = (birthday: string | null) => {
    if (!birthday) return null;
    try {
      return differenceInYears(new Date(), parseISO(birthday));
    } catch {
      return null;
    }
  };

  const userAge = profile?.birthday ? calculateAge(profile.birthday) : profile?.age;

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setIsDarkMode(true);
    } else if (savedTheme === "light") {
      document.documentElement.classList.remove("dark");
      setIsDarkMode(false);
    }
  }, []);

  // Handle avatar upload
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    setIsUploadingAvatar(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/avatar.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: `${publicUrl}?t=${Date.now()}` })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      toast({
        title: "Profile picture updated",
        description: "Your new avatar has been saved.",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Handle avatar removal
  const handleRemoveAvatar = async () => {
    if (!user?.id) return;

    setIsRemovingAvatar(true);
    try {
      // Remove from storage
      await supabase.storage.from("avatars").remove([
        `${user.id}/avatar.jpg`,
        `${user.id}/avatar.png`,
        `${user.id}/avatar.jpeg`,
        `${user.id}/avatar.webp`
      ]);

      // Update profile
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("user_id", user.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      toast({
        title: "Profile picture removed",
        description: "Your avatar has been removed.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to remove picture",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsRemovingAvatar(false);
    }
  };

  // Handle edit field
  const openEditDialog = (field: "height" | "weight") => {
    setEditField(field);
    setEditValue(
      field === "height" 
        ? profile?.height_cm?.toString() || "" 
        : profile?.weight_kg?.toString() || ""
    );
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!user?.id || !editField) return;

    setIsSavingEdit(true);
    try {
      const updateData = editField === "height" 
        ? { height_cm: Number(editValue) }
        : { weight_kg: Number(editValue) };

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("user_id", user.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      toast({
        title: "Updated successfully",
        description: `Your ${editField} has been updated.`,
      });
      setIsEditDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are the same.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });
      setIsPasswordDialogOpen(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({
        title: "Failed to update password",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (!user?.id) return;

    setIsDeletingAccount(true);
    try {
      await supabase.from("meal_analyses").delete().eq("user_id", user.id);
      await supabase.from("mood_logs").delete().eq("user_id", user.id);
      await supabase.from("nutrition_goals").delete().eq("user_id", user.id);
      await supabase.from("user_streaks").delete().eq("user_id", user.id);
      await supabase.from("user_badges").delete().eq("user_id", user.id);
      await supabase.from("user_challenge_progress").delete().eq("user_id", user.id);
      await supabase.from("profiles").delete().eq("user_id", user.id);

      await supabase.storage.from("avatars").remove([`${user.id}/avatar.jpg`, `${user.id}/avatar.png`]);

      await signOut();
      
      toast({
        title: "Account deleted",
        description: "Your account and all data have been removed.",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Failed to delete account",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const getInitials = () => {
    if (profile?.display_name) {
      return profile.display_name.slice(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border/30">
        <div className="container py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold">Settings</h1>
        </div>
      </header>

      <main className="container py-8 pb-24 space-y-8 max-w-lg mx-auto">
        {/* Profile Section - Cal AI style */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <Avatar className="w-24 h-24 border-4 border-background shadow-xl">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="text-2xl bg-primary/10 text-primary font-medium">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
            >
              {isUploadingAvatar ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{profile?.display_name || "User"}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
          {profile?.avatar_url && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRemoveAvatar}
              disabled={isRemovingAvatar}
              className="text-muted-foreground hover:text-destructive"
            >
              {isRemovingAvatar ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <X className="w-4 h-4 mr-2" />
              )}
              Remove Photo
            </Button>
          )}
        </div>

        {/* Stats Cards - Cal AI style */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-2xl p-4 text-center border border-border/50">
            <p className="text-2xl font-bold text-foreground">{userAge || "—"}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Age</p>
          </div>
          <button 
            onClick={() => openEditDialog("height")}
            className="bg-card rounded-2xl p-4 text-center border border-border/50 hover:border-primary/50 transition-colors"
          >
            <p className="text-2xl font-bold text-foreground">{profile?.height_cm || "—"}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Height cm</p>
          </button>
          <button 
            onClick={() => openEditDialog("weight")}
            className="bg-card rounded-2xl p-4 text-center border border-border/50 hover:border-primary/50 transition-colors"
          >
            <p className="text-2xl font-bold text-foreground">{profile?.weight_kg || "—"}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Weight kg</p>
          </button>
        </div>

        {/* Settings List - Clean minimal style */}
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide px-1 mb-3">Preferences</p>
          
          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border/50">
            <div className="flex items-center gap-3">
              {isDarkMode ? <Moon className="w-5 h-5 text-muted-foreground" /> : <Sun className="w-5 h-5 text-muted-foreground" />}
              <span className="font-medium">Dark Mode</span>
            </div>
            <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
          </div>
        </div>

        {/* Security Section */}
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide px-1 mb-3">Security</p>
          
          <button 
            onClick={() => setIsPasswordDialogOpen(true)}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-card border border-border/50 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">Change Password</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Account Section */}
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide px-1 mb-3">Account</p>
          
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-card border border-border/50 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">Sign Out</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-card border border-destructive/30 hover:bg-destructive/10 transition-colors text-destructive">
                <div className="flex items-center gap-3">
                  <Trash2 className="w-5 h-5" />
                  <span className="font-medium">Delete Account</span>
                </div>
                <ChevronRight className="w-5 h-5" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  Delete Account
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your
                  account and remove all your data including meal history, goals,
                  and progress.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={isDeletingAccount}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
                >
                  {isDeletingAccount && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Delete Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* App Info */}
        <div className="text-center text-sm text-muted-foreground pt-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center">
              <ChefHat className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">NutriMind</span>
          </div>
          <p>Version 1.0.0</p>
        </div>
      </main>

      {/* Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your new password below
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button onClick={handlePasswordChange} disabled={isChangingPassword} className="rounded-xl">
              {isChangingPassword && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Height/Weight Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editField === "height" ? <Ruler className="w-5 h-5" /> : <Scale className="w-5 h-5" />}
              Edit {editField === "height" ? "Height" : "Weight"}
            </DialogTitle>
            <DialogDescription>
              Update your {editField === "height" ? "height in centimeters" : "weight in kilograms"}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-value">{editField === "height" ? "Height (cm)" : "Weight (kg)"}</Label>
              <Input
                id="edit-value"
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder={editField === "height" ? "170" : "70"}
                min={editField === "height" ? 100 : 30}
                max={editField === "height" ? 250 : 300}
                step={editField === "height" ? 1 : 0.1}
                className="rounded-xl text-lg"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSavingEdit} className="rounded-xl">
              {isSavingEdit && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
