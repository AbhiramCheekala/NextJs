"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { useToast } from "@/hooks/use-toast";

const roles = ["Admin", "Member"];

const generatePassword = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$!";
  let pwd = "";
  for (let i = 0; i < 10; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd;
};

export default function AddTeamMemberPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { toast } = useToast();
  const router = useRouter();

  const handleGeneratePassword = () => {
    const newPassword = generatePassword();
    setPassword(newPassword);
    setConfirmPassword(newPassword);
    toast({
      title: "Password Generated",
      description: "A secure password has been generated and pre-filled.",
    });
  };

  const handleSubmit = async () => {
    if (!name || !email || !role || !password || !confirmPassword) {
      toast({
        title: "Missing Information",
        description: "Please fill out all fields.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords Mismatch",
        description: "The password and confirm password fields do not match.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      name,
      email,
      password,
      role,
      confirmPassword, // Include confirmPassword for backend validation
    };

    try {
      await apiRequest("/api/users", "POST", payload);
      toast({
        title: "Team Member Added",
        description: `${name} has been successfully added to the team.`,
      });
      router.push("/team"); // Navigate back to the team list
    } catch (error: unknown) {
      toast({
        title: "Error Adding Member",
        description: (error instanceof Error ? error.message : "Something went wrong."),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserPlus className="mr-2 h-5 w-5" /> Add New Team Member
          </CardTitle>
          <CardDescription>
            Enter the details for the new team member.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
              <Label htmlFor="memberName" className="md:text-right">
                Name
              </Label>
              <Input
                id="memberName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                placeholder="John Doe"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
              <Label htmlFor="memberEmail" className="md:text-right">
                Email
              </Label>
              <Input
                id="memberEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="col-span-3"
                placeholder="name@example.com"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
              <Label htmlFor="memberRole" className="md:text-right">
                Role
              </Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="col-span-3" id="memberRole">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r} value={r.toLowerCase()}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
              <Label htmlFor="memberPassword" className="md:text-right">
                Password
              </Label>
              <Input
                id="memberPassword"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="col-span-3"
                placeholder="Enter password"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
              <Label htmlFor="confirmPassword" className="md:text-right">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="col-span-3"
                placeholder="Confirm password"
              />
            </div>
            <div className="col-start-1 md:col-start-2 col-span-full md:col-span-3 flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGeneratePassword}
                className="mr-2"
              >
                Auto-generate Password
              </Button>
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
              Add Member
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
