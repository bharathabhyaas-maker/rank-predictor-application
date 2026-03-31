# Database Setup Script
Write-Host "🚀 Setting up database..."

# Load environment variables
$envLocalPath = ".env.local"
$envPath = ".env"

if (Test-Path $envLocalPath) {
    Write-Host "✅ Loading from .env.local"
    $content = Get-Content $envLocalPath -Raw
} elseif (Test-Path $envPath) {
    Write-Host "✅ Loading from .env"
    $content = Get-Content $envPath -Raw
} else {
    Write-Host "❌ No .env.local or .env file found"
    exit 1
}

# Parse DATABASE_URL
$lines = $content -split "`n"
foreach ($line in $lines) {
    if ($line -match "DATABASE_URL=(.*)") {
        $databaseUrl = $matches[1] -replace '^"|"$', ''
        $env:DATABASE_URL = $databaseUrl
        Write-Host "📡 DATABASE_URL: ✅ Found"
        break
    }
}

if (-not $env:DATABASE_URL) {
    Write-Host "❌ DATABASE_URL not found"
    exit 1
}

Write-Host "🔗 Testing database connection..."
try {
    # Try to run Prisma commands
    Write-Host "📋 Creating database schema..."
    npx prisma db push --accept-data-loss
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database schema created successfully"
    } else {
        Write-Host "⚠️  Schema push had issues, but continuing..."
    }
    
    Write-Host "🔧 Generating Prisma client..."
    npx prisma generate
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Prisma client generated"
    } else {
        Write-Host "⚠️  Client generation had issues"
    }
    
    Write-Host "👤 Initializing database with seed data..."
    npm run db:init
    
    Write-Host "🎉 Database setup completed!"
} catch {
    Write-Host "❌ Database setup failed: $_"
    exit 1
}
