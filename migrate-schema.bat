@echo off
echo Setting DATABASE_URL and running migration...
cd /d "c:\rank predictor application\rank-predictor"

REM Set environment variable for this session
set DATABASE_URL=postgresql://postgres:Bharathteja@localhost:5432/rank_predictor

echo DATABASE_URL set to: %DATABASE_URL%
echo.
echo Running Prisma migration...
npx prisma migrate dev --name add_conditions

echo.
echo Migration completed!
pause
