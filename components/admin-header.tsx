"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AdminHeaderProps {
  showBack?: boolean
  backLink?: string
  title: string
}

export default function AdminHeader({ showBack = false, backLink = "/admin/dashboard", title }: AdminHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            {showBack && (
              <Link href={backLink}>
                <Button variant="ghost" size="sm" className="bg-transparent">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
            )}
            <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          </div>
        </div>
      </div>
    </div>
  )
}
