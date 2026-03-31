@echo off
echo Setting DATABASE_URL and pushing schema...
cd /d "c:\rank predictor application\rank-predictor"

REM Set environment variable for this session
set DATABASE_URL=postgresql://postgres:Bharathteja@localhost:5432/rank_predictor

echo DATABASE_URL set to: %DATABASE_URL%
echo.
echo Running Prisma db push (safer than migrate)...
npx prisma db push

echo.
echo Schema push completed!
echo Your 9th table 'exam_conditions' should now be created!
pause
