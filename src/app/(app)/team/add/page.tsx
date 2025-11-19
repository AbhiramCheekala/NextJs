"use client";

import { useState } from "react";
import { UserPlus, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/apiClient";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { toast } = useToast();
  const router = useRouter();

  const handleGeneratePassword = () => {
    const newPassword = generatePassword();
    setPassword(newPassword);
    setConfirmPassword(newPassword);
    toast({ title: "Password Generated", description: "A secure password has been generated." });
  };

  const handleSubmit = async () => {
    if (!name || !email || !password || !confirmPassword || !role) {
      toast({ title: "Missing Information", description: "Please fill out all fields.", variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "Passwords Mismatch", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    if (password.length < 8) {
      toast({ title: "Password Too Short", description: "Minimum 8 characters.", variant: "destructive" });
      return;
    }

    try {
      await apiRequest("/api/users", "POST", { name, email, password, confirmPassword, role });
      toast({ title: "Team Member Added", description: `${name} has been added.` });
      router.push("/team");
      router.refresh();
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Something went wrong.", variant: "destructive" });
    }
  };

  return (
    <div className="flex justify-center w-full py-10 px-4">
      <div className="w-full max-w-2xl">
        <Card className="shadow-md border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
              <UserPlus className="h-5 w-5" /> Add New Team Member
            </CardTitle>
            <CardDescription>Fill in the team member details below.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-1">
              <Label htmlFor="memberName">Name</Label>
              <Input id="memberName" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="memberEmail">Email</Label>
              <Input id="memberEmail" type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="memberPassword">Password</Label>
              <div className="relative">
                <Input id="memberPassword" type={showPassword ? "text" : "password"} value={password} placeholder="Enter password" onChange={(e) => setPassword(e.target.value)} className="pr-12" />
                <Button type="button" variant="ghost" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={confirmPassword} placeholder="Confirm password" onChange={(e) => setConfirmPassword(e.target.value)} className="pr-12" />
                <Button type="button" variant="ghost" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="secondary" size="sm" onClick={handleGeneratePassword}>Auto-generate Password</Button>
            </div>

            <div className="space-y-1">
              <Label htmlFor="memberRole">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="memberRole">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r} value={r.toLowerCase()}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button onClick={handleSubmit}>Add Member</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}