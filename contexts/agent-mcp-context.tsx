"use client"

import { createContext, useContext, useState, type ReactNode, useEffect } from "react"
import type { MCPTask } from "@/lib/mcp"

interface AgentMcpContextValue {
  tasks: MCPTask[]
  addTask: (task: MCPTask) => void
  removeTask: (taskId: string) => void
  updateTask: (taskId: string, updates: Partial<MCPTask>) => void
  getTaskById: (taskId: string) => MCPTask | undefined
  configActiveTaskId: string | null
  setConfigActiveTaskId: (taskId: string | null) => void
  chatActiveTaskId: string | null
  setChatActiveTaskId: (taskId: string | null) => void
}

const AgentMcpContext = createContext<AgentMcpContextValue | undefined>(undefined)

export function AgentMcpProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<MCPTask[]>([
    {
      id: "default",
      name: "Store(MPC)",
      model: "gpt-4.1-mini",
      reasoningType: "Intelligence",
      servers: [],
    },
  ])
  const [configActiveTaskId, setConfigActiveTaskId] = useState<string | null>("default")
  const [chatActiveTaskId, setChatActiveTaskId] = useState<string | null>(null) // Initialize to null or first task

  useEffect(() => {
    if (!chatActiveTaskId && tasks.length > 0) {
      setChatActiveTaskId(tasks[0].id)
    }
  }, [tasks, chatActiveTaskId])

  const addTask = (task: MCPTask) => {
    setTasks((prev) => [...prev, task])
  }

  const removeTask = (taskId: string) => {
    setTasks((prevTasks) => {
      const newTasks = prevTasks.filter((t) => t.id !== taskId)
      if (configActiveTaskId === taskId) {
        setConfigActiveTaskId(newTasks.length > 0 ? newTasks[0].id : null)
      }
      if (chatActiveTaskId === taskId) {
        setChatActiveTaskId(newTasks.length > 0 ? newTasks[0].id : null)
      }
      return newTasks
    })
  }

  const updateTask = (taskId: string, updates: Partial<MCPTask>) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t)))
  }

  const getTaskById = (taskId: string) => {
    return tasks.find((t) => t.id === taskId)
  }

  return (
    <AgentMcpContext.Provider
      value={{
        tasks,
        addTask,
        removeTask,
        updateTask,
        getTaskById,
        configActiveTaskId,
        setConfigActiveTaskId,
        chatActiveTaskId,
        setChatActiveTaskId,
      }}
    >
      {children}
    </AgentMcpContext.Provider>
  )
}

export function useAgentMcpContext() {
  const context = useContext(AgentMcpContext)
  if (!context) {
    throw new Error("useAgentMcpContext must be used within AgentMcpProvider")
  }
  return context
}
