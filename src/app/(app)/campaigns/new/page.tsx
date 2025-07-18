
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Wand2, CheckSquare, Users, CalendarClock, Tag as TagIcon, PlusCircle, X, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { useContacts } from "@/hooks/useContacts";
import type { ContactTag } from "@/types/contact";
import { useToast } from "@/hooks/use-toast";

// Mock templates for selection
const mockTemplates = [
  { id: "TPL001", name: "Welcome Message", category: "UTILITY" },
  { id: "TPL002", name: "Order Confirmation", category: "TRANSACTIONAL" },
  { id: "TPL003", name: "New Promotion Q3", category: "MARKETING" },
  { id: "TPL004", name: "Appointment Reminder", category: "UTILITY" },
];

const StepNameAndTemplate = ({
  campaignName,
  setCampaignName,
  selectedTemplateId,
  setSelectedTemplateId,
  onNext
}: {
  campaignName: string;
  setCampaignName: (name: string) => void;
  selectedTemplateId: string | null;
  setSelectedTemplateId: (id: string | null) => void;
  onNext: () => void;
}) => (
  <Card>
    <CardHeader>
      <CardTitle>Step 1: Campaign Details & Template</CardTitle>
      <CardDescription>Name your campaign and choose a message template.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      <div>
        <Label htmlFor="campaignName">Campaign Name</Label>
        <Input
          id="campaignName"
          value={campaignName}
          onChange={(e) => setCampaignName(e.target.value)}
          placeholder="e.g., Summer Sale Kickoff"
          className="mt-1"
        />
      </div>
      <div>
        <Label>Select Template</Label>
        <RadioGroup
          value={selectedTemplateId || ""}
          onValueChange={setSelectedTemplateId}
          className="mt-2 space-y-2"
        >
          {mockTemplates.map((template) => (
            <Label
              key={template.id}
              htmlFor={template.id}
              className="flex items-center space-x-2 p-3 border rounded-md hover:bg-muted/50 cursor-pointer data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
              data-state={selectedTemplateId === template.id ? "checked" : "unchecked"}
            >
              <RadioGroupItem value={template.id} id={template.id} />
              <div>
                <span className="font-semibold">{template.name}</span>
                <span className="text-xs ml-2 text-muted-foreground data-[state=checked]:text-primary-foreground/80">({template.category})</span>
              </div>
            </Label>
          ))}
        </RadioGroup>
        {!selectedTemplateId && mockTemplates.length === 0 && (
            <p className="text-sm text-muted-foreground mt-2">No templates available. Please create one first.</p>
        )}
      </div>
      <Button onClick={onNext} disabled={!campaignName || !selectedTemplateId}>
        Next: Choose Audience
      </Button>
    </CardContent>
  </Card>
);

const StepChooseAudience = ({
  selectedTags,
  setSelectedTags,
  onNext,
  onPrevious
}: {
  selectedTags: ContactTag[];
  setSelectedTags: (tags: ContactTag[]) => void;
  onNext: () => void;
  onPrevious: () => void;
}) => {
  const { allContacts } = useContacts(); // We only need allContacts to derive allAvailableTags
  const [tagInput, setTagInput] = useState('');
  const [isTagPopoverOpen, setIsTagPopoverOpen] = useState(false);

  const allAvailableTags = Array.from(new Set(allContacts.flatMap(c => c.tags))).sort();

  const handleAddTag = (tagToAdd: ContactTag) => {
    if (tagToAdd && !selectedTags.includes(tagToAdd)) {
      setSelectedTags([...selectedTags, tagToAdd]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: ContactTag) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };
  
  const filteredSuggestedTags = allAvailableTags.filter(
    (tag) => !selectedTags.includes(tag) && tag.toLowerCase().includes(tagInput.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 2: Choose Audience</CardTitle>
        <CardDescription>Select contact labels to target your campaign.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="tags-audience-popover-trigger" className="flex items-center mb-1">
            <TagIcon className="h-4 w-4 mr-1 text-muted-foreground" /> Target Labels
          </Label>
          <Popover open={isTagPopoverOpen} onOpenChange={setIsTagPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" aria-expanded={isTagPopoverOpen} className="w-full justify-between" id="tags-audience-popover-trigger">
                {selectedTags.length > 0 ? `${selectedTags.length} label(s) selected` : "Select or create labels..."}
                <PlusCircle className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
              <Command>
                <CommandInput
                  placeholder="Type to search or create..."
                  value={tagInput}
                  onValueChange={setTagInput}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && tagInput.trim() && !allAvailableTags.includes(tagInput.trim()) && !selectedTags.includes(tagInput.trim())) {
                      e.preventDefault();
                      handleAddTag(tagInput.trim());
                    }
                  }}
                />
                <CommandList>
                  <CommandEmpty>
                    {tagInput.trim() && !allAvailableTags.includes(tagInput.trim()) && !selectedTags.includes(tagInput.trim()) ? (
                      <CommandItem
                        onSelect={() => handleAddTag(tagInput.trim())}
                        className="cursor-pointer"
                      >
                        Create "{tagInput.trim()}"
                      </CommandItem>
                    ) : (
                      "No labels found or all matching labels selected."
                    )}
                  </CommandEmpty>
                  <CommandGroup>
                    {filteredSuggestedTags.map((tag) => (
                      <CommandItem
                        key={tag}
                        value={tag}
                        onSelect={() => handleAddTag(tag)}
                        className="cursor-pointer"
                      >
                        {tag}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <div className="mt-2 flex flex-wrap gap-1 min-h-[20px]">
            {selectedTags.map(tag => (
              <Badge key={tag} variant="secondary" className="flex items-center">
                {tag}
                <Button variant="ghost" size="icon" className="ml-1 h-4 w-4 p-0" onClick={() => handleRemoveTag(tag)} aria-label={`Remove ${tag}`}>
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex justify-between">
          <Button variant="outline" onClick={onPrevious}>Previous</Button>
          <Button onClick={onNext} disabled={selectedTags.length === 0}>Next: Schedule Campaign</Button>
        </div>
      </CardContent>
    </Card>
  );
};

const StepScheduleCampaign = ({
  scheduleOption,
  setScheduleOption,
  scheduledAt,
  setScheduledAt,
  onPrevious,
  onSubmit
}: {
  scheduleOption: 'now' | 'later';
  setScheduleOption: (option: 'now' | 'later') => void;
  scheduledAt: string;
  setScheduledAt: (dateTime: string) => void;
  onPrevious: () => void;
  onSubmit: () => void;
}) => (
  <Card>
    <CardHeader>
      <CardTitle>Step 3: Schedule Campaign</CardTitle>
      <CardDescription>Choose when to send your campaign.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      <RadioGroup value={scheduleOption} onValueChange={(value) => setScheduleOption(value as 'now' | 'later')} className="space-y-2">
        <Label htmlFor="sendNow" className="flex items-center space-x-2 p-3 border rounded-md hover:bg-muted/50 cursor-pointer">
          <RadioGroupItem value="now" id="sendNow" />
          <span>Send Immediately</span>
        </Label>
        <Label htmlFor="scheduleLater" className="flex items-center space-x-2 p-3 border rounded-md hover:bg-muted/50 cursor-pointer">
          <RadioGroupItem value="later" id="scheduleLater" />
          <span>Schedule for Later</span>
        </Label>
      </RadioGroup>

      {scheduleOption === 'later' && (
        <div className="space-y-2">
          <Label htmlFor="scheduledAt">Scheduled Date & Time</Label>
          <Input
            id="scheduledAt"
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="mt-1"
          />
        </div>
      )}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>Previous</Button>
        <Button onClick={onSubmit} disabled={scheduleOption === 'later' && !scheduledAt}>
            <Send className="mr-2 h-4 w-4"/> Launch Campaign
        </Button>
      </div>
    </CardContent>
  </Card>
);


export default function CreateCampaignPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // State for campaign data
  const [campaignName, setCampaignName] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [selectedAudienceTags, setSelectedAudienceTags] = useState<ContactTag[]>([]);
  const [scheduleOption, setScheduleOption] = useState<'now' | 'later'>('now');
  const [scheduledAt, setScheduledAt] = useState('');


  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSubmitCampaign = () => {
    const campaignData = {
      name: campaignName,
      templateId: selectedTemplateId,
      audienceTags: selectedAudienceTags,
      schedule: {
        type: scheduleOption,
        dateTime: scheduleOption === 'later' ? scheduledAt : new Date().toISOString(),
      }
    };
    console.log("Submitting campaign data:", campaignData);
    toast({
      title: "Campaign Submitted (Mock)",
      description: `Campaign "${campaignName}" is being processed.`,
    });
    // Simulate API call
    // alert("Campaign Submitted! Redirecting to Outbox."); // Placeholder
    router.push('/outbox?campaignName=' + encodeURIComponent(campaignName)); // Pass campaign name for context
  };

  const progressPercentage = (currentStep / totalSteps) * 100;

  const stepIcons = [
    { icon: CheckSquare, label: "Details & Template" },
    { icon: Users, label: "Audience" },
    { icon: CalendarClock, label: "Schedule" }
  ];


  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-headline font-semibold">Create New Campaign</h1>
      </div>

      <Card className="w-full">
        <CardHeader>
            <div className="flex items-center gap-2">
                <Wand2 className="h-6 w-6 text-primary"/>
                <CardTitle>Campaign Creation Wizard</CardTitle>
            </div>
            <CardDescription>Follow the steps below to set up and launch your new WhatsApp campaign.</CardDescription>
             <div className="pt-4">
                <Progress value={progressPercentage} className="w-full mb-2" />
                <div className="flex justify-between text-sm text-muted-foreground">
                    {stepIcons.map((step, index) => (
                        <div key={index} className={`flex items-center gap-1 ${index + 1 <= currentStep ? 'font-semibold text-primary' : ''}`}>
                            <step.icon className={`h-4 w-4 ${index + 1 <= currentStep ? 'text-primary' : 'text-muted-foreground'}`} />
                            {step.label}
                        </div>
                    ))}
                </div>
            </div>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && (
            <StepNameAndTemplate
              campaignName={campaignName}
              setCampaignName={setCampaignName}
              selectedTemplateId={selectedTemplateId}
              setSelectedTemplateId={setSelectedTemplateId}
              onNext={nextStep}
            />
          )}
          {currentStep === 2 && (
            <StepChooseAudience
              selectedTags={selectedAudienceTags}
              setSelectedTags={setSelectedAudienceTags}
              onNext={nextStep}
              onPrevious={prevStep}
            />
          )}
          {currentStep === 3 && (
            <StepScheduleCampaign
              scheduleOption={scheduleOption}
              setScheduleOption={setScheduleOption}
              scheduledAt={scheduledAt}
              setScheduledAt={setScheduledAt}
              onPrevious={prevStep}
              onSubmit={handleSubmitCampaign}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    