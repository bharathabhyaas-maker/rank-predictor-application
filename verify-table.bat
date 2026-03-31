@echo off
echo Verifying 9th table was created...
cd /d "c:\rank predictor application\rank-predictor"

set DATABASE_URL=postgresql://postgres:Bharathteja@localhost:5432/rank_predictor

echo Running verification script...
npx tsx verify-9th-table.ts

pause
