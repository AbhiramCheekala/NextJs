
'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AddTeamMemberDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSuccess: (memberName: string) => void;
}

const roles = ["Admin", "Manager", "Agent"];

export function AddTeamMemberDialog({ isOpen, onOpenChange, onSuccess }: AddTeamMemberDialogProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setName('');
    setEmail('');
    setRole('');
  };

  const handleSubmit = async () => {
    if (!name || !email || !role) {
        toast({
            title: "Missing Information",
            description: "Please fill out all fields.",
            variant: "destructive",
        });
        return;
    }
    // TODO: Implement actual API call
    console.log("Submitting new team member:", { name, email, role });
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    onSuccess(name); // Pass name for toast message
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <UserPlus className="mr-2 h-5 w-5" /> Add New Team Member
          </DialogTitle>
          <DialogDescription>
            Enter the details for the new team member. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="memberName" className="text-right">Name</Label>
            <Input id="memberName" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" placeholder="John Doe" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="memberEmail" className="text-right">Email</Label>
            <Input id="memberEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="col-span-3" placeholder="name@example.com" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="memberRole" className="text-right">Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="col-span-3" id="memberRole">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r} value={r.toLowerCase()}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" onClick={handleSubmit}>Save Member</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
