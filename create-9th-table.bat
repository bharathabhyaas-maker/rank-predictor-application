@echo off
echo Creating 9th table: exam_conditions...
cd /d "c:\rank predictor application\rank-predictor"

REM Set database URL
set DATABASE_URL=postgresql://postgres:Bharathteja@localhost:5432/rank_predictor

REM Create the exam_conditions table using SQL
psql -U postgres -d rank_predictor -c "
CREATE TABLE exam_conditions (
    id VARCHAR(191) PRIMARY KEY DEFAULT (cuid()),
    exam_id VARCHAR(191) NOT NULL,
    parameter VARCHAR(255) NOT NULL,
    operator VARCHAR(50) NOT NULL,
    value VARCHAR(255) NOT NULL,
    operator2 VARCHAR(50),
    value2 VARCHAR(255),
    best_case_percentile DECIMAL(5,2),
    worst_case_percentile DECIMAL(5,2),
    best_case_rank INTEGER,
    worst_case_rank INTEGER,
    avg_rank INTEGER,
    avg_percentile DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_exam_conditions_exam_id 
        FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
);

CREATE INDEX idx_exam_conditions_exam_id ON exam_conditions(exam_id);
"

echo.
echo ✅ 9th table 'exam_conditions' created successfully!
echo.
echo Your database now has 9 tables:
echo 1. users
echo 2. institutions  
echo 3. templates
echo 4. institution_templates
echo 5. predictions
echo 6. datasets
echo 7. team_members
echo 8. exams
echo 9. exam_conditions (NEW!)
echo.
echo Now you can:
echo 1. Create exams with conditions
echo 2. Your conditions will be stored in the separate table
echo 3. Conditional predictions will use your stored conditions
echo.
pause
