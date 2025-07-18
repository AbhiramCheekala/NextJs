import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // Default to false (desktop) to match server-side behavior where window is undefined
  const [isMobileReal, setIsMobileReal] = React.useState<boolean>(false);
  const [hasMounted, setHasMounted] = React.useState(false);

  React.useEffect(() => {
    setHasMounted(true); // Component has mounted on client
    const checkDevice = () => {
      setIsMobileReal(window.innerWidth < MOBILE_BREAKPOINT);
    };

    checkDevice(); // Check immediately on mount
    window.addEventListener('resize', checkDevice); // Add resize listener

    return () => window.removeEventListener('resize', checkDevice);
  }, []); // Empty dependency array means this runs once on mount (client-side)

  // During SSR and first client render (before hasMounted is true), return a consistent default.
  // After mounting, return the actual client-side determined value.
  if (!hasMounted) {
    return false; // This ensures server and initial client render see 'false' for isMobile
  }
  return isMobileReal;
}
