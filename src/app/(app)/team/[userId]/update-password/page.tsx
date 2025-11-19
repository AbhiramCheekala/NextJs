"use client";

import { useEffect, useState } from "react";
import { KeyRound, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { apiRequest } from "@/lib/apiClient"; // Import apiRequest

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

type User = {
  id: string;
  name: string;
  email: string;
  role?: string;
  lastLoginAt?: string;
};

export default function UpdatePasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [user, setUser] = useState<User | null>(null); // State to hold user info
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;

  useEffect(() => {
    if (userId) {
      // Fetch user details to display name in the title
      const fetchUser = async () => {
        try {
          const response = await apiRequest(`/api/users/${userId}`, "GET");
          setUser(response.data);
        } catch (error: unknown) {
          toast({
            title: "Error",
            description: (error instanceof Error ? error.message : "Failed to fetch user details."),
            variant: "destructive",
          });
          router.back();
        }
      };
      fetchUser();
    }
  }, [userId, toast, router]);

  const handleSubmit = async () => {
    if (!newPassword || !confirmNewPassword) {
      toast({
        title: "Missing Information",
        description: "Please fill out all fields.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast({
        title: "Passwords Mismatch",
        description: "The new password and confirm password fields do not match.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiRequest(`/api/users/${userId}/password`, "PUT", { userId: userId, newPassword: newPassword, confirmPassword: confirmNewPassword });
      toast({
        title: "Password Updated",
        description: `Password for ${user?.name || "user"} has been successfully updated.`,
      });
      router.push("/team"); // Navigate back to the team list
    } catch (error: unknown) {
      toast({
        title: "Error Updating Password",
        description: (error instanceof Error ? error.message : "Something went wrong."),
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto py-8 max-w-2xl text-center">
        Loading user details...
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <KeyRound className="mr-2 h-5 w-5" /> Update Password for {user.name}
          </CardTitle>
          <CardDescription>
            Enter a new password for {user.name}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
              <Label htmlFor="newPassword" className="md:text-right">
                New Password
              </Label>
              <div className="col-span-3 relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pr-10"
                  placeholder="Enter new password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
              <Label htmlFor="confirmNewPassword" className="md:text-right">
                Confirm New Password
              </Label>
              <div className="col-span-3 relative">
                <Input
                  id="confirmNewPassword"
                  type={showConfirmNewPassword ? "text" : "password"}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="pr-10"
                  placeholder="Confirm new password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmNewPassword((prev) => !prev)}
                >
                  {showConfirmNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" onClick={handleSubmit}>
              Update Password
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
