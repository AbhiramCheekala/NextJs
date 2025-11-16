"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function NetworkStatusNotifier() {
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => {
      if (!isOnline) {
        toast({
          title: "You are back online!",
          description: "Your internet connection has been restored.",
          variant: "default",
        });
      }
      setIsOnline(true);
    };

    const handleOffline = () => {
      toast({
        title: "You are offline!",
        description: "Please check your internet connection.",
        variant: "destructive",
      });
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Set initial state
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [toast, isOnline]);

  return null; // This component does not render anything
}
