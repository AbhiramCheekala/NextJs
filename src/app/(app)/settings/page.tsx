
'use client';

import React, { Suspense, useMemo } from 'react'; // Import useMemo
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Globe, KeyRound, Webhook, Clock4, UserCircle, CreditCard, Bell } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const validTabs = ["profile", "api", "webhooks", "general", "billing"];
const defaultTab = "profile";

function SettingsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Derive activeTab directly from URL search parameters
  const activeTab = useMemo(() => {
    const tabParam = searchParams.get('tab');
    return tabParam && validTabs.includes(tabParam) ? tabParam : defaultTab;
  }, [searchParams]);

  const handleTabChange = (newTab: string) => {
    // When a tab is clicked, update the URL.
    // The 'activeTab' variable will automatically update on the next render
    // because 'searchParams' will have changed.
    router.push(`/settings?tab=${newTab}`, { scroll: false });
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-headline font-semibold">Settings</h1>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 mb-4">
          <TabsTrigger value="profile"><UserCircle className="mr-1 h-4 w-4 md:hidden lg:inline-block" /> Business Profile</TabsTrigger>
          <TabsTrigger value="api"><KeyRound className="mr-1 h-4 w-4 md:hidden lg:inline-block" /> API Keys</TabsTrigger>
          <TabsTrigger value="webhooks"><Webhook className="mr-1 h-4 w-4 md:hidden lg:inline-block" /> Webhooks</TabsTrigger>
          <TabsTrigger value="general"><Clock4 className="mr-1 h-4 w-4 md:hidden lg:inline-block" /> General</TabsTrigger>
          <TabsTrigger value="billing"><CreditCard className="mr-1 h-4 w-4 md:hidden lg:inline-block" /> Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Business Profile</CardTitle>
              <CardDescription>Manage your WhatsApp Business Account details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input id="businessName" defaultValue="Acme Corp Marketing" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="businessDescription">Description</Label>
                <Textarea id="businessDescription" defaultValue="Leading provider of innovative marketing solutions." />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="businessAddress">Address</Label>
                <Input id="businessAddress" defaultValue="123 Innovation Drive, Tech City" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="businessWebsite">Website</Label>
                <Input id="businessWebsite" type="url" defaultValue="https://acme.example.com" />
              </div>
              <Button>Save Profile</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>Manage API keys for Meta WhatsApp Cloud API and OpenAI.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="metaToken">Meta WhatsApp Token</Label>
                <Input id="metaToken" type="password" placeholder="TODO: Enter Meta Token" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="openaiKey">OpenAI API Key</Label>
                <Input id="openaiKey" type="password" placeholder="TODO: Enter OpenAI API Key" />
              </div>
               <div className="grid gap-2">
                <Label htmlFor="s3Bucket">AWS S3 Bucket Name</Label>
                <Input id="s3Bucket" placeholder="TODO: Enter S3 Bucket Name" />
              </div>
              <Button>Save API Keys</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks">
          <Card>
            <CardHeader>
              <CardTitle>Webhooks</CardTitle>
              <CardDescription>Configure webhook URLs for incoming messages and status updates.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="webhookUrl">Webhook URL</Label>
                <Input id="webhookUrl" type="url" placeholder="https://yourapi.com/webhook/whatsapp" />
                <p className="text-xs text-muted-foreground">This URL will receive events from Meta.</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="verifyToken">Verify Token</Label>
                <Input id="verifyToken" placeholder="Your secret verify token" />
                 <p className="text-xs text-muted-foreground">Used by Meta to verify your webhook.</p>
              </div>
              <Button>Save Webhook Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="general">
            <Card>
                <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                    <CardDescription>Application-wide settings like timezone and notifications.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <Input id="timezone" defaultValue="America/New_York" />
                         <p className="text-xs text-muted-foreground">Affects scheduling and display times.</p>
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="notifications">Notifications</Label>
                         <div className="flex items-center space-x-2">
                            <Bell className="h-4 w-4"/>
                            <span>Email notifications for critical alerts are <strong>Enabled</strong>.</span>
                        </div>
                         <Button variant="outline">Manage Notification Preferences</Button>
                    </div>
                    <Button>Save General Settings</Button>
                </CardContent>
            </Card>
        </TabsContent>

         <TabsContent value="billing">
            <Card>
                <CardHeader>
                    <CardTitle>Billing &amp; Subscription</CardTitle>
                    <CardDescription>Manage your subscription plan and payment methods.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">Current Plan: <strong>Pro Plan</strong> ($99/month)</p>
                    <p className="text-muted-foreground">Next billing date: August 15, 2024</p>
                    <div className="flex gap-2">
                        <Button>Change Plan</Button>
                        <Button variant="outline">View Payment History</Button>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
       <p className="text-center text-muted-foreground mt-6">Configuration for business profile, API keys, webhooks, timezone, etc., will be fully implemented here.</p>
    </div>
  );
}

// Wrap with Suspense because useSearchParams() needs it for static rendering
export default function SettingsPage() {
  return (
    <Suspense fallback={<div>Loading settings...</div>}>
      <SettingsPageContent />
    </Suspense>
  );
}
