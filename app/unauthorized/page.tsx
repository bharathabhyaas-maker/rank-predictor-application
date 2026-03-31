import Link from "next/link"
import { Shield, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-purple-200 text-lg">
            You don't have permission to access this page.
          </p>
        </div>

        <div className="space-y-4">
          <Link href="/">
            <Button className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-semibold py-3 rounded-lg transition-all">
              Go to Homepage
            </Button>
          </Link>
          
          <Link href="/auth/super-admin/login">
            <Button variant="outline" className="w-full border-purple-500/30 text-purple-300 hover:bg-purple-500/10 hover:text-purple-200">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
          </Link>
        </div>

        <p className="text-slate-400 text-sm mt-8">
          If you believe this is an error, please contact your administrator.
        </p>
      </div>
    </div>
  )
}
