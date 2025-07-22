"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { UserPlus, ListFilter, Edit3, Trash2 } from "lucide-react";
import axios from "axios";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AddTeamMemberDialog } from "@/components/team/add-team-member-dialog";
import { useToast } from "@/hooks/use-toast";

// 🔷 Pagination settings
const ITEMS_PER_PAGE = 3;

type User = {
  id: string;
  name: string;
  email: string;
  role?: string;
  lastLoginAt?: string;
};

function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get("http://localhost:9002/api/users");
        setUsers(response.data || []);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return { users, isLoading };
}

const roleVariant = (role: string) => {
  switch (role.toLowerCase()) {
    case "admin":
      return "destructive";
    case "manager":
      return "default";
    case "agent":
      return "secondary";
    default:
      return "outline";
  }
};

export default function TeamPage() {
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const { users, isLoading } = useUsers();

  const handleAddMemberSuccess = (memberName: string) => {
    toast({
      title: "Team Member Added",
      description: `${memberName} has been successfully added to the team.`,
    });
  };

  const handleEditUser = (userName: string) => {
    toast({
      title: "Edit User (Not Implemented)",
      description: `Editing functionality for ${userName} will be available soon.`,
    });
  };

  const handleDeleteUser = (userName: string) => {
    toast({
      title: "Delete User (Not Implemented)",
      description: `Deleting ${userName} will be available soon.`,
      variant: "destructive",
    });
  };

  // 🔷 Pagination logic
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedUsers = users.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const totalPages = Math.ceil(users.length / ITEMS_PER_PAGE);

  return (
    <div className="flex flex-col gap-6">
      <AddTeamMemberDialog
        isOpen={isAddMemberDialogOpen}
        onOpenChange={setIsAddMemberDialogOpen}
        onSuccess={handleAddMemberSuccess}
      />

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline font-semibold">
          Team Management
        </h1>
        <Button onClick={() => setIsAddMemberDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" /> Add Team Member
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            Manage user roles, permissions, and activity.
          </CardDescription>
          <div className="flex items-center gap-2 pt-4">
            <Input placeholder="Search team members..." className="max-w-sm" />
            <Button variant="outline">
              <ListFilter className="mr-2 h-4 w-4" /> Filter by Role
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5}>Loading team members...</TableCell>
                </TableRow>
              ) : paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium flex items-center">
                      <Avatar className="h-8 w-8 mr-3">
                        <AvatarImage src="" alt={user.name} />
                        <AvatarFallback>
                          {user.name?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {user.name}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={roleVariant(user.role || "") as any}>
                        {user.role ?? "—"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.lastLoginAt
                        ? format(
                            new Date(user.lastLoginAt),
                            "yyyy-MM-dd hh:mm a"
                          )
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Edit User"
                        onClick={() => handleEditUser(user.name)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Delete User"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteUser(user.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5}>No team members found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* 🔷 Pagination Controls */}
          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Next
            </Button>
          </div>

          <p className="text-center text-muted-foreground mt-6">
            Role-based access control, chat assignment, and activity log
            features will be implemented here.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>
            Recent team activities and system events.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Activity log will be displayed here...
          </p>
          <div className="h-40 bg-muted rounded-md flex items-center justify-center text-sm">
            Activity Feed Area
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
