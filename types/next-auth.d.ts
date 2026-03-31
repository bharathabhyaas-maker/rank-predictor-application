import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      institutionId?: string
      institution?: {
        id: string
        name: string
        email: string
        location: string
        phone?: string
        plan: string
        status: string
        institutionId: string
      }
    } & DefaultSession["user"]
  }

  interface User {
    role: string
    institutionId?: string
    institution?: {
      id: string
      name: string
      email: string
      location: string
      phone?: string
      plan: string
      status: string
      institutionId: string
    }
  }

  interface JWT {
    role: string
    institutionId?: string
    institution?: any
  }
}
