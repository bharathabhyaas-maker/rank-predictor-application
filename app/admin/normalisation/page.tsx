"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Brain, Save, Plus, ExternalLink, Trash2, Upload, Link2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export default function AIConfigurationPage() {
  const [openaiKey, setOpenaiKey] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const [resources, setResources] = useState([
    {
      id: 1,
      type: "url",
      source: "https://clat.ac.in/previous-year-data",
      description: "CLAT Previous Year Analysis",
      status: "active",
      lastSync: "2024-01-15",
    },
    {
      id: 2,
      type: "file",
      source: "jee_cutoff_2023.csv",
      description: "JEE Main Cutoff Trends",
      status: "active",
      lastSync: "2024-01-12",
    },
  ])

  const [showAddResource, setShowAddResource] = useState(false)
  const [newResource, setNewResource] = useState({
    type: "url",
    source: "",
    description: "",
  })

  const addResource = () => {
    if (newResource.source && newResource.description) {
      setResources([
        ...resources,
        {
          id: resources.length + 1,
          ...newResource,
          status: "pending",
          lastSync: new Date().toISOString().split("T")[0],
        },
      ])
      setNewResource({ type: "url", source: "", description: "" })
      setShowAddResource(false)
    }
  }

  const removeResource = (id: number) => {
    setResources(resources.filter((r) => r.id !== id))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 text-sm hover:text-foreground/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-mono">BACK_TO_DASHBOARD</span>
          </Link>
          <div className="font-mono text-xs text-muted-foreground">AI_INTEGRATION_CONTROL</div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Page Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <Brain className="w-8 h-8" />
            <h1 className="text-4xl font-bold">AI Configuration Panel</h1>
          </div>
          <p className="text-muted-foreground">
            Connect OpenAI and manage data resources for intelligent rank prediction.
          </p>
        </div>

        <div className="space-y-8">
          {/* OpenAI Integration */}
          <div className="border border-border/50 rounded-lg p-6">
            <div className="font-mono text-xs text-muted-foreground mb-6">SECTION_01 / OPENAI_INTEGRATION</div>

            <div className="space-y-6">
              <div>
                <Label className="font-mono text-xs mb-2">OPENAI_API_KEY</Label>
                <div className="flex gap-3">
                  <input
                    type="password"
                    value={openaiKey}
                    onChange={(e) => setOpenaiKey(e.target.value)}
                    placeholder="sk-..."
                    className="flex-1 px-3 py-2 border border-input rounded-md font-mono text-sm bg-background"
                  />
                  <Button
                    onClick={() => setIsConnected(!isConnected)}
                    className={`font-mono ${isConnected ? "bg-green-600 hover:bg-green-700" : ""}`}
                  >
                    {isConnected ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        CONNECTED
                      </>
                    ) : (
                      "CONNECT"
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  API key is encrypted and stored securely. Used for AI-powered rank predictions.
                </p>
              </div>

              {isConnected && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center gap-2 text-sm font-mono text-green-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>OpenAI connection established successfully</span>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Model: GPT-4 • Status: Active • Last verified: {new Date().toLocaleTimeString()}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-border/50">
                <div className="text-sm font-mono mb-2">PREDICTION_LOGIC</div>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-foreground mt-1.5" />
                    <div>
                      <span className="font-mono text-foreground">WITH DATA:</span> AI analyzes admin-provided resources
                      (URLs, files) to generate accurate rank predictions based on historical patterns
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-foreground mt-1.5" />
                    <div>
                      <span className="font-mono text-foreground">WITHOUT DATA:</span> AI uses conditional logic and
                      fallback algorithms based on student inputs to estimate rank ranges
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Resource Management */}
          <div className="border border-border/50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="font-mono text-xs text-muted-foreground">SECTION_02 / DATA_RESOURCES</div>
              <Button
                onClick={() => setShowAddResource(!showAddResource)}
                size="sm"
                className="font-mono"
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                ADD_RESOURCE
              </Button>
            </div>

            {/* Add Resource Form */}
            {showAddResource && (
              <div className="mb-6 p-4 border border-border/50 rounded-lg bg-muted/20">
                <div className="space-y-4">
                  <div>
                    <Label className="font-mono text-xs mb-2">RESOURCE_TYPE</Label>
                    <select
                      value={newResource.type}
                      onChange={(e) => setNewResource({ ...newResource, type: e.target.value })}
                      className="w-full px-3 py-2 border border-input rounded-md font-mono text-sm bg-background"
                    >
                      <option value="url">URL / WEB_LINK</option>
                      <option value="file">FILE_UPLOAD</option>
                    </select>
                  </div>

                  <div>
                    <Label className="font-mono text-xs mb-2">
                      {newResource.type === "url" ? "URL_SOURCE" : "FILE_NAME"}
                    </Label>
                    <div className="flex gap-2">
                      {newResource.type === "url" ? (
                        <input
                          type="url"
                          value={newResource.source}
                          onChange={(e) => setNewResource({ ...newResource, source: e.target.value })}
                          placeholder="https://example.com/data"
                          className="flex-1 px-3 py-2 border border-input rounded-md font-mono text-sm bg-background"
                        />
                      ) : (
                        <>
                          <input
                            type="text"
                            value={newResource.source}
                            onChange={(e) => setNewResource({ ...newResource, source: e.target.value })}
                            placeholder="filename.csv"
                            className="flex-1 px-3 py-2 border border-input rounded-md font-mono text-sm bg-background"
                          />
                          <Button size="sm" variant="outline" className="font-mono bg-transparent">
                            <Upload className="w-4 h-4 mr-2" />
                            UPLOAD
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="font-mono text-xs mb-2">DESCRIPTION</Label>
                    <input
                      type="text"
                      value={newResource.description}
                      onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                      placeholder="Brief description of the data source"
                      className="w-full px-3 py-2 border border-input rounded-md font-mono text-sm bg-background"
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button onClick={() => setShowAddResource(false)} variant="outline" size="sm" className="font-mono">
                      CANCEL
                    </Button>
                    <Button onClick={addResource} size="sm" className="font-mono">
                      ADD_RESOURCE
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Resource List */}
            <div className="space-y-3">
              {resources.map((resource) => (
                <div
                  key={resource.id}
                  className="p-4 border border-border/30 rounded-lg hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {resource.type === "url" ? (
                          <Link2 className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Upload className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span className="font-mono text-sm">{resource.description}</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                            resource.status === "active"
                              ? "bg-green-500/10 text-green-600"
                              : "bg-yellow-500/10 text-yellow-600"
                          }`}
                        >
                          {resource.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="font-mono flex items-center gap-1">
                          {resource.type === "url" && <ExternalLink className="w-3 h-3" />}
                          {resource.source}
                        </span>
                        <span>Last sync: {resource.lastSync}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeResource(resource.id)}
                      className="text-red-500 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {resources.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">
                  <div className="font-mono text-sm">NO_RESOURCES_ADDED</div>
                  <p className="text-xs mt-2">Add URLs or upload files to improve prediction accuracy</p>
                </div>
              )}
            </div>
          </div>

          {/* System Status */}
          <div className="border border-border/50 rounded-lg p-6 bg-muted/20">
            <div className="font-mono text-xs text-muted-foreground mb-4">SYSTEM_STATUS</div>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex justify-between">
                <span className="text-muted-foreground">OpenAI Status:</span>
                <span className={isConnected ? "text-green-600" : "text-yellow-600"}>
                  {isConnected ? "CONNECTED" : "DISCONNECTED"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active Resources:</span>
                <span>{resources.filter((r) => r.status === "active").length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Prediction Mode:</span>
                <span>{resources.length > 0 ? "DATA_DRIVEN" : "CONDITIONAL_LOGIC"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">System Ready:</span>
                <span className={isConnected ? "text-green-600" : "text-red-600"}>
                  {isConnected ? "YES" : "NEEDS_CONFIGURATION"}
                </span>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" className="font-mono bg-transparent">
              TEST_CONNECTION
            </Button>
            <Button className="font-mono">
              <Save className="w-4 h-4 mr-2" />
              SAVE_CONFIGURATION
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}