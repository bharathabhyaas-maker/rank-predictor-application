# Super Admin Credentials Setup

## 🚀 Quick Setup

Run this command to create super admin credentials:

```bash
npm run db:seed-super-admin
```

## 🔑 Generated Credentials

The seed script will create a super admin with these credentials:

- **Email**: `superadmin@rankpredictor.com`
- **Password**: `SuperAdmin123!`
- **Role**: `SUPER_ADMIN`

## 🌐 Login URL

Use these credentials to login at:
```
http://localhost:3000/auth/super-admin/login
```

## 📋 What the Seed Does

1. **Checks for existing super admin** - Won't create duplicates
2. **Hashes password securely** - Uses bcrypt with salt rounds
3. **Creates user with proper role** - SUPER_ADMIN role
4. **Sets institutionId to null** - Super admin doesn't belong to any institution
5. **Displays credentials** - Shows login info in console

## 🔧 Alternative: Run Directly

If npm script doesn't work, run directly:

```bash
npx tsx prisma/seed-super-admin.ts
```

## 🛡️ Security Notes

- **Change the password** after first login for production
- **Store credentials securely** - Don't commit to version control
- **Use environment variables** for production credentials

## 📝 Next Steps After Login

1. **Create institutions** - Add educational institutions
2. **Create templates** - Build prediction templates
3. **Assign templates** - Link templates to institutions
4. **Test permissions** - Verify role-based access control

## 🔍 Troubleshooting

If you get import errors, make sure:
- Database is running and connected
- Prisma client is generated: `npx prisma generate`
- Environment variables are set properly

The seed script handles all the setup automatically!
