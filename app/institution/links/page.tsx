"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  Link2, Copy, Check, Eye, ExternalLink, QrCode, 
  Download, Share2, Mail, MessageSquare, Brain, Database, Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import InstitutionNavigation from "@/components/institution-navigation"
import { useAuth } from "@/lib/auth-context"
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock"
import QRCode from 'qrcode'

export default function StudentLinksPage() {
  const { user } = useAuth()
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [showQRModal, setShowQRModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null)
  
  // Use body scroll lock when QR modal is open
  useBodyScrollLock(showQRModal)

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    let institutionId = user?.institution?.id || user?.institutionId
    
    console.log('🔍 Student Links - Using institutionId:', institutionId)
    
    if (!institutionId) {
      console.log('❌ No institution ID found in user context')
      setError('No institution ID found')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      // Fetch assigned templates for this institution
      const templatesResponse = await fetch(`/api/institution-templates?institutionId=${institutionId}`)
      
      if (!templatesResponse.ok) {
        throw new Error(`Failed to fetch templates: ${templatesResponse.status}`)
      }
      
      const data = await templatesResponse.json()
      console.log('🔍 Student Links - Fetched templates:', data)
      
      // Transform data to match expected format
      const transformedTemplates = data.map((template: any) => ({
        id: template.id,
        name: template.name,
        type: template.type || 'ai',
        status: template.status,
        shareLink: template.shareLink,
        totalClicks: template.totalClicks || 0,
        uniqueVisitors: template.uniqueVisitors || 0,
        predictions: template.predictions || 0,
      }))
      
      setTemplates(transformedTemplates)
    } catch (error) {
      console.error('❌ Failed to load templates:', error)
      setError(error instanceof Error ? error.message : 'Failed to load templates')
    } finally {
      setLoading(false)
    }
  }

  const copyLink = (link: string, id: string) => {
    const fullUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/predict/${link}`
    navigator.clipboard.writeText(fullUrl)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const getFullUrl = (link: string) => {
    return `${typeof window !== "undefined" ? window.location.origin : ""}/predict/${link}`
  }

  const generateQRCode = async (link: string) => {
    try {
      const url = getFullUrl(link)
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 200,
        margin: 2,
        color: {
          dark: '#059669',
          light: '#FFFFFF'
        }
      })
      setQrCodeDataUrl(qrDataUrl)
    } catch (error) {
      console.error('❌ Failed to generate QR code:', error)
    }
  }

  const shareViaWhatsApp = (template: any) => {
    const url = getFullUrl(template.shareLink)
    const message = `🎯 *${template.name}*\n\nPredict your rank with our AI-powered tool!\n\n🔗 ${url}\n\n📊 Get instant results with accurate predictions\n🎯 Personalized rank analysis\n📈 Performance insights\n\nDon't miss out on this opportunity!`
    
    const encodedMessage = encodeURIComponent(message)
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank')
  }

  const shareViaEmail = (template: any) => {
    const url = getFullUrl(template.shareLink)
    const subject = `🎯 ${template.name} - Predict Your Rank`
    const body = `Dear Student,\n\nExciting news! You can now predict your rank for ${template.name} using our AI-powered prediction tool.\n\n🔗 Prediction Link: ${url}\n\n📊 Features:\n• Instant rank prediction\n• Accurate AI analysis\n• Personalized insights\n• Performance metrics\n\nThis tool will help you understand your potential rank and plan your preparation accordingly.\n\nBest regards,\nYour Institution Team\n\n---\nNote: This prediction is based on the provided data and should be used as a guidance tool.`
    
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
  }

  const downloadQRCode = () => {
    if (!qrCodeDataUrl) return
    
    const link = document.createElement('a')
    link.href = qrCodeDataUrl
    link.download = `qr-code-${selectedTemplate}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const openQRModal = async (template: any) => {
    setSelectedTemplate(template.id)
    await generateQRCode(template.shareLink)
    setShowQRModal(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-teal-50">
      <InstitutionNavigation />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Student Links
          </h1>
          <p className="text-muted-foreground">
            Generate shareable links for students to access prediction tools.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
              <span className="text-lg text-muted-foreground">Loading templates...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center">
            <p className="text-red-800 font-medium mb-2">Failed to load templates</p>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <Button onClick={loadTemplates} className="bg-red-600 hover:bg-red-700">
              Try Again
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && templates.length === 0 && (
          <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Link2 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Templates Available</h3>
            <p className="text-gray-600 mb-4">
              No prediction templates have been assigned to your institution yet.
            </p>
            <Button onClick={loadTemplates} className="bg-emerald-600 hover:bg-emerald-700">
              Refresh
            </Button>
          </div>
        )}

        {/* Link Cards */}
        {!loading && !error && templates.length > 0 && (
          <div className="space-y-6">
            {templates.map((template) => (
            <div 
              key={template.id} 
              className={`bg-white border-2 rounded-2xl overflow-hidden shadow-lg ${
                template.status === "active" ? "border-emerald-200" : "border-gray-200 opacity-75"
              }`}
            >
              {/* Header */}
              <div className={`px-6 py-4 border-b ${
                template.status === "active" 
                  ? "bg-gradient-to-r from-emerald-100 to-teal-100 border-emerald-200"
                  : "bg-gray-100 border-gray-200"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-white ${
                      template.type === "ai" 
                        ? "bg-gradient-to-br from-emerald-500 to-teal-500"
                        : "bg-gradient-to-br from-teal-500 to-cyan-500"
                    }`}>
                      {template.type === "ai" ? <Brain className="w-6 h-6" /> : <Database className="w-6 h-6" />}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">{template.name}</h2>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        template.status === "active" 
                          ? "bg-green-100 text-green-700" 
                          : "bg-gray-200 text-gray-600"
                      }`}>
                        {template.status}
                      </span>
                    </div>
                  </div>
                  <Link href={`/predict/${template.shareLink}`} target="_blank">
                    <Button size="sm" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                      <Eye className="w-4 h-4 mr-1" />
                      Preview
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Link Box */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Shareable Link</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center gap-2 bg-emerald-50 border-2 border-emerald-200 rounded-xl px-4 py-3">
                      <Link2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <Link 
                        href={`/predict/${template.shareLink}`} 
                        target="_blank"
                        className="text-sm font-mono text-emerald-800 truncate flex-1 hover:text-emerald-900 hover:underline cursor-pointer"
                      >
                        {getFullUrl(template.shareLink)}
                      </Link>
                    </div>
                    <Button
                      onClick={() => copyLink(template.shareLink, template.id)}
                      variant="outline"
                      className={`px-4 transition-all ${
                        copiedId === template.id 
                          ? "bg-green-100 border-green-300 text-green-700"
                          : "bg-transparent border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                      }`}
                    >
                      {copiedId === template.id ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Share Options */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Quick Share</label>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="bg-transparent border-gray-200 hover:bg-gray-100"
                      onClick={() => openQRModal(template)}
                    >
                      <QrCode className="w-4 h-4 mr-2" />
                      QR Code
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="bg-transparent border-gray-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700"
                      onClick={() => shareViaEmail(template)}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="bg-transparent border-gray-200 hover:bg-green-50 hover:border-green-200 hover:text-green-700"
                      onClick={() => shareViaWhatsApp(template)}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      WhatsApp
                    </Button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-gray-900">{template.totalClicks.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground font-medium">Total Clicks</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-gray-900">{template.uniqueVisitors.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground font-medium">Unique Visitors</p>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-emerald-700">{template.predictions.toLocaleString()}</p>
                    <p className="text-xs text-emerald-600 font-medium">Predictions Made</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          </div>
        )}

        {/* QR Code Modal */}
        {showQRModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
              <h3 className="text-lg font-bold text-center mb-4">QR Code</h3>
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6 flex items-center justify-center mb-4">
                {qrCodeDataUrl ? (
                  <img 
                    src={qrCodeDataUrl} 
                    alt="QR Code" 
                    className="w-48 h-48 rounded-lg"
                  />
                ) : (
                  <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                  </div>
                )}
              </div>
              <p className="text-sm text-center text-muted-foreground mb-4">
                Students can scan this QR code to access the prediction tool
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowQRModal(false)
                    setQrCodeDataUrl(null)
                  }} 
                  className="flex-1 bg-transparent"
                >
                  Close
                </Button>
                <Button 
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600"
                  onClick={downloadQRCode}
                  disabled={!qrCodeDataUrl}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
