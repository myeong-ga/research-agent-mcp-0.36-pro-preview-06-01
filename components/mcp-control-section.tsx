"use client"
import { useState } from "react"
import Image from "next/image"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Loader2, AlertCircle, Settings, XIcon } from "lucide-react"
import { useAgentMcpContext } from "@/contexts/agent-mcp-context"
import type { MCPServerConfig, MCPTask } from "@/lib/mcp"

interface MCPControlSectionProps {
  className?: string
}

type RequireApprovalValue = "never" | "always"

interface FetchedTool {
  name: string
  selected: boolean
}

interface PredefinedServer {
  id: string
  name: string
  iconSrc: string
  label: string
  url: string
}

const predefinedServers: PredefinedServer[] = [
  {
    id: "toyota",
    name: "Toyota Used Cars",
    iconSrc: "/assets/icons/toyota-logo.svg",
    label: "usedcar",
    url: "https://server.smithery.ai/@yusaaztrk/car-price-mcp-main/mcp?api_key=af39d80a-b79d-4c24-a516-a18cb76ef126",
  },
  {
    id: "shopify",
    name: "Shopify",
    iconSrc: "/assets/icons/shopify-logo.svg",
    label: "shopify",
    url: "https://userplane.myshopify.com/api/mcp",
  },
  {
    id: "airbnb",
    name: "Airbnb",
    iconSrc: "/assets/icons/airbnb-logo.svg",
    label: "airbnb",
    url: "https://server.smithery.ai/@openbnb-org/mcp-server-airbnb/mcp?api_key=af39d80a-b79d-4c24-a516-a18cb76ef126",
  },
]

export function MCPControlSection({ className }: MCPControlSectionProps) {
  const { tasks, configActiveTaskId, setConfigActiveTaskId, updateTask, addTask } = useAgentMcpContext()

  const [newServerUrl, setNewServerUrl] = useState("")
  const [newServerLabel, setNewServerLabel] = useState("")

  const activeConfigTask = tasks.find((t) => t.id === configActiveTaskId)

  const [showAddTaskForm, setShowAddTaskForm] = useState(false)
  const [newTaskName, setNewTaskName] = useState("")
  const [newTaskModel, setNewTaskModel] = useState("gpt-4.1-mini")

  const [isConfiguringServer, setIsConfiguringServer] = useState(false)
  const [isValidatingServer, setIsValidatingServer] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [fetchedTools, setFetchedTools] = useState<FetchedTool[]>([])
  const [fetchedSuggestedPrompts, setFetchedSuggestedPrompts] = useState<string[]>([])
  const [currentServerApproval, setCurrentServerApproval] = useState<RequireApprovalValue>("always")

  const handlePredefinedServerClick = (server: PredefinedServer) => {
    setNewServerLabel(server.label)
    setNewServerUrl(server.url)
  }

  const handleAddServerClick = async () => {
    if (!newServerUrl.trim() || !newServerLabel.trim()) {
      setValidationError("Server URL and Label are required.")
      return
    }
    setIsValidatingServer(true)
    setValidationError(null)
    try {
      const response = await fetch("/api/mcp/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ server_url: newServerUrl, server_label: newServerLabel }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to validate server.")
      }
      setFetchedTools(data.tools.map((name: string) => ({ name, selected: true })))
      setFetchedSuggestedPrompts(data.suggestedPrompts || [])
      setCurrentServerApproval("always")
      setIsConfiguringServer(true)
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : "Unknown validation error.")
    } finally {
      setIsValidatingServer(false)
    }
  }

  const handleToolSelectionChange = (toolName: string, checked: boolean) => {
    setFetchedTools((prevTools) =>
      prevTools.map((tool) => (tool.name === toolName ? { ...tool, selected: checked } : tool)),
    )
  }

  const saveConfiguredServer = () => {
    if (!activeConfigTask) return

    const selectedToolNames = fetchedTools.filter((tool) => tool.selected).map((tool) => tool.name)

    const newServer: MCPServerConfig = {
      label: newServerLabel,
      url: newServerUrl,
      allowedTools: selectedToolNames.length > 0 ? selectedToolNames : undefined,
      requireApproval: currentServerApproval,
      suggestedPrompts: fetchedSuggestedPrompts.length > 0 ? fetchedSuggestedPrompts : undefined,
    }

    updateTask(activeConfigTask.id, {
      servers: [...activeConfigTask.servers, newServer],
    })

    setNewServerUrl("")
    setNewServerLabel("")
    setIsConfiguringServer(false)
    setFetchedTools([])
    setFetchedSuggestedPrompts([])
    setValidationError(null)
  }

  const removeServer = (index: number) => {
    if (!activeConfigTask) return
    updateTask(activeConfigTask.id, {
      servers: activeConfigTask.servers.filter((_, i) => i !== index),
    })
  }

  const addNewTask = () => {
    if (!newTaskName.trim()) return
    const newTask: MCPTask = {
      id: `task-${Date.now()}`,
      name: newTaskName,
      model: newTaskModel,
      servers: [],
    }
    addTask(newTask)
    setNewTaskName("")
    setNewTaskModel("gpt-4.1-mini")
    setShowAddTaskForm(false)
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center font-normal text-lg">
            <Settings className="mr-2 h-5 w-5" /> Task Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-normal">Manage Tasks</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAddTaskForm(!showAddTaskForm)}
                aria-expanded={showAddTaskForm}
                aria-controls="add-task-form"
              >
                {showAddTaskForm ? (
                  <>
                    <XIcon className="h-4 w-4 mr-1" /> Cancel
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-1" /> Add Task
                  </>
                )}
              </Button>
            </div>

            {showAddTaskForm && (
              <div id="add-task-form" className="space-y-3 mb-4 p-4 border rounded-md bg-muted/30">
                <Input
                  placeholder="새로운 관심사 이름 (예 : 주식 )"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                />
                <Select value={newTaskModel} onValueChange={(value) => setNewTaskModel(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select model for new task" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4.1-mini">gpt-4.1-mini</SelectItem>
                    <SelectItem value="gpt-4.1">gpt-4.1</SelectItem>
                    <SelectItem value="o1">o1 (OpenAI)</SelectItem>
                    <SelectItem value="o1-mini">o1-mini (OpenAI)</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button onClick={addNewTask} disabled={!newTaskName.trim()} size="sm">
                    Create Task
                  </Button>
                  <Button onClick={() => setShowAddTaskForm(false)} variant="ghost" size="sm">
                    Close
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="configActiveTaskSelect" className="text-sm font-normal mb-3 block">
              관심사 선택
            </Label>
            <Select
              value={configActiveTaskId || ""}
              onValueChange={(value) => setConfigActiveTaskId(value === "no-tasks" ? null : value)}
            >
              <SelectTrigger id="configActiveTaskSelect">
                <SelectValue placeholder="Select a task to configure" />
              </SelectTrigger>
              <SelectContent>
                {tasks.length === 0 ? (
                  <SelectItem value="no-tasks" disabled>
                    No tasks available. Add a task first.
                  </SelectItem>
                ) : (
                  <SelectItem value="dummy" disabled={!!configActiveTaskId}>
                    Select a task
                  </SelectItem>
                )}
                {tasks.map((task) => (
                  <SelectItem key={task.id} value={task.id}>
                    {task.name} 🤖 {task.model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-normal mb-3 mt-3 pt-3 block">
              해당관심사에 등록된 서버
            </Label>
            {activeConfigTask?.servers.map((server, index) => (
              <div key={index} className="flex items-center gap-2 p-3 border rounded-md bg-muted/20">
                <div className="flex-1">
                  <div className="font-normal">{server.label}</div>
                  <div className="text-xs text-muted-foreground break-all">{server.url}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Approval: <span className="font-semibold">{server.requireApproval}</span> | Tools:{" "}
                    <span className="font-semibold">{server.allowedTools?.join(", ") || "All"}</span>
                  </div>
                  {server.suggestedPrompts && server.suggestedPrompts.length > 0 && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Suggestions: {server.suggestedPrompts.length} available
                    </div>
                  )}
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => removeServer(index)}
                  aria-label={`Remove ${server.label} server`}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}

            <div className="space-y-3 pt-3 border-t mt-4">
              <Input
                placeholder="New Server Label (e.g., My Shop API)"
                value={newServerLabel}
                onChange={(e) => setNewServerLabel(e.target.value)}
                disabled={!activeConfigTask}
              />
              <Input
                placeholder="New Server URL (e.g., https://mcp.example.com)"
                value={newServerUrl}
                onChange={(e) => setNewServerUrl(e.target.value)}
                disabled={!activeConfigTask}
              />
              {validationError && (
                <div className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" /> {validationError}
                </div>
              )}
              <Button
                variant="ghost"
                onClick={handleAddServerClick}
                disabled={!newServerUrl || !newServerLabel || isValidatingServer || !activeConfigTask}
                className="w-full font-normal"
              >
                {isValidatingServer ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Validate & Add Server
              </Button>
              {!activeConfigTask && (
                <p className="text-xs text-center text-muted-foreground pt-1">
                  Select a task above to configure its MCP servers.
                </p>
              )}

              <div className="pt-4">
                <Label className="text-muted-foreground mb-3 block text-center">
                  Or use a predefined MCP server:
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {predefinedServers.map((server) => (
                    <Button
                      key={server.id}
                      variant="outline"
                      className="h-auto py-2 px-3 flex flex-col items-center justify-center gap-1.5 hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
                      onClick={() => handlePredefinedServerClick(server)}
                      disabled={!activeConfigTask}
                      aria-label={`Use ${server.name} server`}
                    >
                      <div className="relative w-10 h-10">
                        <Image
                          src={server.iconSrc || "/placeholder.svg"}
                          alt={`${server.name} logo`}
                          width={40}
                          height={40}
                          className="object-contain"
                        />
                      </div>
                      <span className="text-xs text-center">{server.name}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isConfiguringServer} onOpenChange={setIsConfiguringServer}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Configure MCP Server: {newServerLabel}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="requireApproval" className="text-sm font-medium mb-1 block">
                Require Approval Policy
              </Label>
              <Select
                value={currentServerApproval}
                onValueChange={(value: RequireApprovalValue) => setCurrentServerApproval(value)}
              >
                <SelectTrigger id="requireApproval">
                  <SelectValue placeholder="Select approval policy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">Never (Auto-approve all tool calls)</SelectItem>
                  <SelectItem value="always">Always (Require manual approval for each tool call)</SelectItem>
                  <SelectItem value="auto">Auto (AI decides, may not be supported by all models)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium mb-1 block">Available Tools</Label>
              {fetchedTools.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No specific tools reported by this server. All tools will be allowed by default if none are selected.
                </p>
              ) : (
                <ScrollArea className="max-h-60 overflow-y-auto space-y-2 border p-3 rounded-md bg-muted/20">
                  {fetchedTools.map((tool) => (
                    <div key={tool.name} className="flex items-center space-x-2">
                      <Checkbox
                        id={`tool-${tool.name.replace(/\s+/g, "-")}`}
                        checked={tool.selected}
                        onCheckedChange={(checked) => handleToolSelectionChange(tool.name, !!checked)}
                      />
                      <Label htmlFor={`tool-${tool.name.replace(/\s+/g, "-")}`} className="font-normal cursor-pointer">
                        {tool.name}
                      </Label>
                    </div>
                  ))}
                </ScrollArea>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                If no tools are selected, all tools from the server will be implicitly allowed.
              </p>
            </div>
            {fetchedSuggestedPrompts.length > 0 && (
              <div>
                <Label className="text-sm font-medium mb-1 block">
                  Suggested Prompts ({fetchedSuggestedPrompts.length})
                </Label>
                <ScrollArea className="max-h-40 overflow-y-auto space-y-1 border p-3 rounded-md text-sm text-muted-foreground bg-muted/20">
                  {fetchedSuggestedPrompts.map((prompt, idx) => (
                    <p key={idx}>&bull; {prompt}</p>
                  ))}
                </ScrollArea>
              </div>
            )}
          </div>
          <DialogFooter className="mt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="button" onClick={saveConfiguredServer}>
              Save Server Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
