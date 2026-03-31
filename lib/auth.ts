import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/database"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" }
      },
      async authorize(credentials: any) {
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Auth - Missing email or password')
          return null
        }

        const { email, password, role } = credentials
        console.log('🔍 Auth - Starting authentication for:', email, 'Role:', role)
        
        let user

        // Find user based on role
        if (role === "super-admin") {
          console.log('🔍 Auth - Looking for ADMIN role user')
          user = await prisma.user.findFirst({
            where: {
              email: email.toLowerCase(),
              role: "ADMIN"
            },
            select: {
              id: true,
              email: true,
              name: true,
              password: true,
              role: true,
              lastLoginAt: true,
              createdAt: true
            }
          })
        } else if (role === "institution") {
          console.log('🔍 Auth - Looking for INSTITUTION role user')
          user = await prisma.user.findFirst({
            where: {
              email: email.toLowerCase(),
              role: "INSTITUTION"
            },
            include: {
              institution: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  location: true,
                  phone: true,
                  plan: true,
                  status: true,
                  institutionId: true
                }
              }
            }
          })
        } else if (role === "student") {
          console.log('🔍 Auth - Looking for STUDENT role user')
          user = await prisma.user.findFirst({
            where: {
              email: email.toLowerCase(),
              role: "STUDENT"
            },
            include: {
              institution: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  location: true,
                  phone: true,
                  plan: true,
                  status: true,
                  institutionId: true
                }
              }
            }
          })
        } else {
          console.log('🔍 Auth - Generic login - looking for any user with email')
          user = await prisma.user.findFirst({
            where: {
              email: email.toLowerCase()
            },
            include: {
              institution: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  location: true,
                  phone: true,
                  plan: true,
                  status: true,
                  institutionId: true
                }
              }
            }
          })
        }

        if (!user) {
          console.log(`❌ Auth - User not found for email: ${email}, role: ${role}`)
          return null
        }

        console.log('✅ Auth - User found:', user.email, 'Role:', user.role)
        
        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password)
        
        if (!isPasswordValid) {
          console.log('❌ Auth - Invalid password')
          return null
        }

        console.log('✅ Auth - Password verified')
        
        // Update last login time
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        })

        console.log('✅ Auth - Login successful')
        
        // Map role for frontend
        let mappedRole = user.role.toLowerCase()
        if (user.role === "ADMIN") {
          mappedRole = "super-admin"
        } else if (user.role === "INSTITUTION") {
          mappedRole = "institution"
        } else if (user.role === "STUDENT") {
          mappedRole = "student"
        }

        console.log('🔄 Auth - Role mapping:', user.role, '→', mappedRole)

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: mappedRole,
          institutionId: user.institution?.institutionId,
          institution: user.institution
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role
        token.institutionId = user.institutionId
        token.institution = user.institution
      }
      return token
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.institutionId = token.institutionId as string
        session.user.institution = token.institution as any
      }
      return session
    }
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error"
  }
}
