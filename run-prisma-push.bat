@echo off
echo Adding conditions field to database...
cd /d "c:\rank predictor application\rank-predictor"

REM Set database URL
set DATABASE_URL=postgresql://postgres:Bharathteja@localhost:5432/rank_predictor

REM Run prisma push to add the conditions field
npx prisma db push

echo.
echo ✅ Conditions field added to database!
echo.
echo Now you can:
echo 1. Create exams with conditions
echo 2. Your entered conditions will be stored
echo 3. Conditional predictions will use your stored conditions
echo.
pause
