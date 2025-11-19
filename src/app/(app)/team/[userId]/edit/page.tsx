"use client";

import { useEffect, useState } from "react";
import { UserPen } from "lucide-react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { apiRequest } from "@/lib/apiClient";

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

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

const roles = ["Admin", "Member"];

export default function EditTeamMemberPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;

  useEffect(() => {
    if (userId) {
      const fetchUser = async () => {
        try {
          const response = await apiRequest(`/api/users/${userId}`, "GET");
          const userData: User = response.data;
          setName(userData.name);
          setEmail(userData.email);
          setRole(userData.role);
        } catch (error: unknown) {
          toast({
            title: "Error",
            description: (error instanceof Error ? error.message : "Failed to fetch user details."),
            variant: "destructive",
          });
          router.back();
        } finally {
          setLoading(false);
        }
      };
      fetchUser();
    }
  }, [userId, toast, router]);

  const handleSubmit = async () => {
    if (!name || !email || !role) {
      toast({
        title: "Missing Information",
        description: "Please fill out all fields.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      name,
      email,
      role,
    };

    try {
      await apiRequest(`/api/users/${userId}`, "PUT", payload);
      toast({
        title: "Team Member Updated",
        description: `${name} has been successfully updated.`,
      });
      router.push("/team");
    } catch (error: unknown) {
      toast({
        title: "Error Updating Member",
        description: (error instanceof Error ? error.message : "Something went wrong."),
        variant: "destructive",
      });
    }
  };

  if (loading) {
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
            <UserPen className="mr-2 h-5 w-5" /> Edit Team Member
          </CardTitle>
          <CardDescription>
            Update the details for {name}.
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
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
