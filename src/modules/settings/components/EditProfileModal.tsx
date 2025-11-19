import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog-new";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/auth-context";
import { useUser } from "@/hooks/useUser";
import { saveInfo } from "@/lib/internal/icp";
import { setEmail, setProfilePicture, setUserName } from "@/lib/redux/store/userSlice";
import { useModalCleanup } from "@/modules/settings/hooks";
import { PROFILE_PICTURES } from "@/modules/shared.constants";
// Image component removed - use <img> tags instead
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { SettingsModalProps } from "../types";

// Wallet Modal Component
const EditProfileModal = ({ open, onClose, onNameSaved }: SettingsModalProps) => {
  const { name, principal, profilePicture, email } = useUser();
  const { authClient } = useAuth();


  const [nameInput, setNameInput] = useState(name || '');
  const [selectedPicture, setSelectedPicture] = useState<string>(profilePicture || '');
  const [emailInput, setEmailInput] = useState(email || '');
  const [isSaving, setIsSaving] = useState(false);
  const dispatch = useDispatch();

  // Use the custom hook for modal cleanup
  useModalCleanup(open);

  // Update input field when modal opens or name changes
  useEffect(() => {
    setNameInput(name || '');
    setSelectedPicture(profilePicture || '');
    setEmailInput(email || '');
  }, [open, name, profilePicture, email]);

  const handleSaveName = async () => {
    setIsSaving(true);
    try {
      if (!principal) throw new Error("No principal found");
      if (!authClient) throw new Error("No auth client found");

      const username = nameInput.toLowerCase().replace(/\s+/g, '');
      const pictureId = selectedPicture.replace('.png', '');



      await saveInfo(principal, {
        nickname: nameInput ? [nameInput] : [],
        username: username ? [username] : [],
        picture: pictureId ? [pictureId] : [],
        email: emailInput ? [emailInput] : []
      });


      dispatch(setUserName(nameInput));
      dispatch(setProfilePicture(selectedPicture));
      dispatch(setEmail(emailInput || null));

      onClose();
      if (onNameSaved) onNameSaved();
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error("Error", { description: "Failed to update profile" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="!bg-[#212121] border border-[#303333] !w-[456px] !max-w-[90vw] max-h-[90vh] overflow-hidden"
        showCloseButton={true}
      >
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription className="text-[#A1A1AA]">
            Make changes to your profile here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>

        <Separator className="my-1 bg-[#424444] h-0.25" />

        {/* Content */}
        <div className="space-y-4">
          {/* Profile Picture Selection */}
          <div>
            <Label className="block text-white mb-3">Profile Picture</Label>
            <div className="grid grid-cols-5 gap-3">
              {PROFILE_PICTURES.map((picture) => (
                <button
                  key={picture}
                  onClick={() => setSelectedPicture(picture)}
                  className={`relative w-12 h-12 rounded-[34px] overflow-hidden border-2 transition-all cursor-pointer ${selectedPicture === picture
                    ? 'border-[#FEB64D] ring-2 ring-[#FEB64D]/20'
                    : 'border-[#505050] hover:border-[#707070]'
                    }`}
                >
                  <img
                    src={`/profiles/${picture}`}
                    alt={picture}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
          {/* Name Input */}
          <div>
            <Label className="block text-white mb-2">Name</Label>
            <div className="bg-[#353535] border border-[#505050] rounded-md p-3">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full bg-transparent text-white placeholder-[#B0B0B0] outline-none"
                placeholder="Enter your nickname"
              />
            </div>
          </div>

          {/* Username Input */}
          <div>
            <Label className="block mb-2">Username</Label>
            <div className="bg-[#353535] border border-[#505050] rounded-md p-3">
              <input
                type="text"
                value={`@${nameInput.toLowerCase().replace(/\s+/g, '')}`}
                readOnly
                className="w-full bg-transparent text-white placeholder-[#B0B0B0] outline-none"
                placeholder="@username"
              />
            </div>
          </div>

          {/* Email Input */}
          <div>
            <Label className="block text-white mb-2">Email</Label>
            <div className="bg-[#353535] border border-[#505050] rounded-md p-3">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value);
                }}
                className="w-full bg-transparent text-white placeholder-[#B0B0B0] outline-none"
                placeholder="Enter your email"
              />
            </div>
          </div>
        </div>
        <DialogFooter className="flex justify-center">
          <Button
            type="submit"
            onClick={handleSaveName}
            disabled={isSaving}
            className="w-full"
          >
            {isSaving ? (
              <svg
                className="animate-spin h-4 w-4"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
            ) : null}
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog >
  );
};

export default EditProfileModal;