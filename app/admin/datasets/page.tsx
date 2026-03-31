"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Database, Download, Search, ChevronLeft, ChevronRight, Plus, Eye, Trash2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import AdminNavigation from "@/components/admin-navigation"

export default function DatasetsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [datasets, setDatasets] = useState<any[]>([])
  const itemsPerPage = 5

  useEffect(() => {
    loadDatasets()
  }, [])

  const loadDatasets = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/datasets')
      const data = await response.json()
      setDatasets(data)
    } catch (error) {
      console.error('Failed to load datasets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  const filteredDatasets = Array.isArray(datasets) ? datasets.filter(
    (ds) =>
      ds.exam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ds.year.includes(searchQuery) ||
      ds.id.toLowerCase().includes(searchQuery.toLowerCase()),
  ) : []

  const totalPages = Math.ceil(filteredDatasets.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedDatasets = filteredDatasets.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className="min-h-screen bg-background">
      <AdminNavigation />

      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard">
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold font-mono tracking-tight">Dataset History</h1>
              <p className="text-sm text-muted-foreground mt-1">
                View historical examination data used for predictions
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search datasets..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9 font-mono"
            />
          </div>
        </div>

        {/* Datasets Table */}
        <div className="border border-border rounded-lg overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <div className="bg-muted/30 border-b border-border">
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3">
                  <div className="font-mono text-xs uppercase text-muted-foreground">Dataset ID</div>
                  <div className="font-mono text-xs uppercase text-muted-foreground">Exam</div>
                  <div className="font-mono text-xs uppercase text-muted-foreground">Year</div>
                  <div className="font-mono text-xs uppercase text-muted-foreground">Predicted List</div>
                  <div className="font-mono text-xs uppercase text-muted-foreground">Size</div>
                  <div className="font-mono text-xs uppercase text-muted-foreground">Status</div>
                  <div className="font-mono text-xs uppercase text-muted-foreground">Actions</div>
                </div>
              </div>

              <div className="divide-y divide-border">
                {paginatedDatasets.length > 0 ? (
                  paginatedDatasets.map((dataset) => (
                    <div
                      key={dataset.id}
                      className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto] gap-4 px-6 py-4 hover:bg-muted/10 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono text-sm">{dataset.id}</span>
                      </div>
                      <div className="text-sm">{dataset.exam}</div>
                      <div className="text-sm font-mono">{dataset.year}</div>
                      <div className="text-sm font-mono">{dataset.records.toLocaleString()} predictions</div>
                      <div className="text-sm font-mono">{dataset.size}</div>
                      <div>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-mono ${
                            dataset.status === "Active"
                              ? "bg-green-500/10 text-green-500 border border-green-500/20"
                              : "bg-muted text-muted-foreground border border-border"
                          }`}
                        >
                          {dataset.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No datasets found
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredDatasets.length)} of{" "}
            {filteredDatasets.length} datasets
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="w-8 h-8 p-0"
                >
                  {page}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-4 gap-4">
          <div className="border border-border rounded-lg p-4">
            <div className="text-sm text-muted-foreground mb-1">Total Datasets</div>
            <div className="text-2xl font-bold font-mono">{Array.isArray(datasets) ? datasets.length : 0}</div>
          </div>
          <div className="border border-border rounded-lg p-4">
            <div className="text-sm text-muted-foreground mb-1">Total Predictions</div>
            <div className="text-2xl font-bold font-mono">
              {Array.isArray(datasets) ? datasets.reduce((acc, ds) => acc + (ds.records || 0), 0).toLocaleString() : '0'}
            </div>
          </div>
          <div className="border border-border rounded-lg p-4">
            <div className="text-sm text-muted-foreground mb-1">Active Datasets</div>
            <div className="text-2xl font-bold font-mono">{Array.isArray(datasets) ? datasets.filter((ds) => ds.status === "Active").length : 0}</div>
          </div>
          <div className="border border-border rounded-lg p-4">
            <div className="text-sm text-muted-foreground mb-1">Total Storage</div>
            <div className="text-2xl font-bold font-mono">
              {Array.isArray(datasets) ? datasets.reduce((acc, ds) => acc + parseFloat(ds.size || 0), 0).toFixed(1) + ' MB' : '0 MB'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}