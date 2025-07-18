
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, ListFilter, Edit3, Trash2 } from "lucide-react";
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
import { AddTeamMemberDialog } from '@/components/team/add-team-member-dialog'; // Import the dialog
import { useToast } from '@/hooks/use-toast'; // Import useToast

const mockTeamMembers = [
  { id: "USR001", name: "Alice Wonderland", email: "alice@example.com", role: "Admin", lastActive: "2024-07-28 10:00 AM", avatar: "https://placehold.co/40x40.png?text=AW", dataAiHint: "user avatar" },
  { id: "USR002", name: "Bob The Builder", email: "bob@example.com", role: "Manager", lastActive: "2024-07-28 09:30 AM", avatar: "https://placehold.co/40x40.png?text=BB", dataAiHint: "user avatar" },
  { id: "USR003", name: "Carol Danvers", email: "carol@example.com", role: "Agent", lastActive: "2024-07-27 17:00 PM", avatar: "https://placehold.co/40x40.png?text=CD", dataAiHint: "user avatar" },
  { id: "USR004", name: "David Copperfield", email: "david@example.com", role: "Agent", lastActive: "Inactive", avatar: "https://placehold.co/40x40.png?text=DC", dataAiHint: "user avatar" },
];

const roleVariant = (role: string) => {
  switch (role.toLowerCase()) { // Ensure comparison is case-insensitive
    case "admin": return "destructive";
    case "manager": return "default";
    case "agent": return "secondary";
    default: return "outline";
  }
};

export default function TeamPage() {
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleAddMemberSuccess = (memberName: string) => {
    toast({
      title: "Team Member Added (Mock)",
      description: `${memberName} has been successfully added to the team.`,
    });
    // Here you would typically refetch your team members list
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
        variant: "destructive"
    });
  };


  return (
    <div className="flex flex-col gap-6">
      <AddTeamMemberDialog
        isOpen={isAddMemberDialogOpen}
        onOpenChange={setIsAddMemberDialogOpen}
        onSuccess={handleAddMemberSuccess}
      />

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline font-semibold">Team Management</h1>
        <Button onClick={() => setIsAddMemberDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" /> Add Team Member
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>Manage user roles, permissions, and activity.</CardDescription>
          <div className="flex items-center gap-2 pt-4">
            <Input placeholder="Search team members..." className="max-w-sm" />
            <Button variant="outline"><ListFilter className="mr-2 h-4 w-4" /> Filter by Role</Button>
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
              {mockTeamMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium flex items-center">
                     <Avatar className="h-8 w-8 mr-3">
                        <AvatarImage src={member.avatar} alt={member.name} data-ai-hint={member.dataAiHint}/>
                        <AvatarFallback>{member.name.split(" ").map(n=>n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    {member.name}
                  </TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>
                    <Badge variant={roleVariant(member.role) as any}>
                      {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{member.lastActive}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" title="Edit User" onClick={() => handleEditUser(member.name)}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Delete User" className="text-destructive hover:text-destructive" onClick={() => handleDeleteUser(member.name)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p className="text-center text-muted-foreground mt-6">Role-based access control, chat assignment, and activity log features will be implemented here.</p>
        </CardContent>
      </Card>
       <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>Recent team activities and system events.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Activity log will be displayed here...</p>
          <div data-ai-hint="activity feed" className="h-40 bg-muted rounded-md flex items-center justify-center text-sm">Activity Feed Area</div>
        </CardContent>
      </Card>
    </div>
  );
}
