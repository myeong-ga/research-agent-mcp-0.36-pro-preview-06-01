import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrentDateTime = () => {
  const now = new Date();
  
  // Get the user's local time zone
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  // Format the date in the user's local time zone
  return now.toLocaleString('en-US', { 
    timeZone,
    dateStyle: 'medium',
    timeStyle: 'medium'
  }) + ` (${getTimeZoneAbbreviation(timeZone)})`;
};

// Helper function to get time zone abbreviation
function getTimeZoneAbbreviation(timeZone: string): string {
  try {
    // Get the time zone abbreviation from the formatted date
    const options: Intl.DateTimeFormatOptions = { timeZoneName: 'short' };
    const shortTimeZone = new Intl.DateTimeFormat('en-US', options)
      .formatToParts(new Date())
      .find(part => part.type === 'timeZoneName')?.value || '';
    
    return shortTimeZone;
  } catch {
    // Fallback if there's an error getting the abbreviation
    return timeZone.split('/').pop() || '';
  }
}