import { toast } from "sonner"

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
    return true
  } catch (error) {
    console.error("Failed to copy to clipboard:", error)
    toast.error("Failed to copy to clipboard")
    return false
  }
}
