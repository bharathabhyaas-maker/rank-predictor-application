# Database Seeding

This document explains how to seed the database with initial data for the Rank Predictor application.

## Available Seed Scripts

### 1. Complete Database Seed
```bash
npm run db:seed
```
Creates:
- Super Admin user
- Test Institution (Anwar Institute)
- Test Templates (JEE Advanced, NEET UG)
- Template assignments

### 2. Super Admin Only Seed
```bash
npm run db:seed-admin
```
Creates only:
- Super Admin user (if doesn't exist)

## Default Credentials

### Super Admin
- **Email**: admin@rankpredict.com
- **Password**: admin123
- **Role**: ADMIN

### Test Institution
- **Name**: Anwar Institute
- **Institution ID**: INST001
- **Email**: contact@anwarinstitute.com
- **Password**: inst123

## Created Data

### Users
- 1 Super Admin user with ADMIN role
- Passwords are hashed using bcrypt

### Institutions
- 1 Test institution with ACTIVE status
- Located in Hyderabad, India

### Templates
- JEE Advanced Rank Predictor (JEE-ADV-2024)
- NEET UG Rank Predictor (NEET-UG-2024)
- Both templates have ACTIVE status

### Assignments
- Both templates are assigned to the test institution
- All assignments have ACTIVE status

## Usage

1. **First time setup**:
   ```bash
   npm run db:push
   npm run db:seed
   ```

2. **Adding only admin**:
   ```bash
   npm run db:seed-admin
   ```

3. **Resetting database**:
   ```bash
   npm run db:push
   npm run db:seed
   ```

## Notes

- Passwords are hashed using bcrypt (10 rounds)
- All IDs are generated using cuid()
- The seed script is idempotent (won't create duplicates)
- Check console output for seeding progress and results

## Testing

After seeding, you can test:

1. **Super Admin Login**: `/auth/super-admin/login`
2. **Institution Login**: `/auth/institution/login`
3. **Dashboard Access**: Both dashboards should show seeded data
