-- Create the 9th table: exam_conditions
-- Run this in your PostgreSQL database

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

-- Create index for faster lookups
CREATE INDEX idx_exam_conditions_exam_id ON exam_conditions(exam_id);

-- Verify table was created
SELECT 'exam_conditions table created successfully' as status;
