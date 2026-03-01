# SQL Queries for HR Attrition Analysis

# 1. Department Attrition Comparison (CTE Example)
QUERY_DEPT_ATTRITION = """
WITH DeptStats AS (
    SELECT
        Department,
        COUNT(*) AS TotalEmployees,
        SUM(CASE WHEN Attrition = 'Yes' THEN 1 ELSE 0 END) AS AttritionCount
    FROM hr_data
    GROUP BY Department
),
CompanyAvg AS (
    SELECT CAST(SUM(AttritionCount) AS FLOAT) / SUM(TotalEmployees) AS AvgRate
    FROM DeptStats
)
SELECT
    d.Department,
    d.TotalEmployees,
    d.AttritionCount,
    ROUND(CAST(d.AttritionCount AS FLOAT) / d.TotalEmployees * 100, 2) AS DeptAttritionRate,
    ROUND(c.AvgRate * 100, 2) AS CompanyAvgRate,
    ROUND((CAST(d.AttritionCount AS FLOAT) / d.TotalEmployees - c.AvgRate) * 100, 2) AS Variance
FROM DeptStats d, CompanyAvg c;
"""

# 2. Salary Benchmarking — Window Function
QUERY_SALARY_BENCHMARK = """
SELECT
    EmployeeID,
    Department,
    JobRole,
    MonthlyIncome,
    ROUND(AVG(MonthlyIncome) OVER(PARTITION BY Department), 2) AS DeptAvgSalary,
    ROUND(MonthlyIncome - AVG(MonthlyIncome) OVER(PARTITION BY Department), 2) AS DiffFromDeptAvg,
    ROUND(PERCENT_RANK() OVER(PARTITION BY Department ORDER BY MonthlyIncome) * 100, 2) AS SalaryPercentile
FROM hr_data
ORDER BY Department, MonthlyIncome DESC;
"""

# 3. Promotion Risk Analysis — Window Function
QUERY_PROMOTION_ANALYSIS = """
SELECT
    EmployeeID,
    JobRole,
    YearsAtCompany,
    YearsSinceLastPromotion,
    ROUND(AVG(YearsSinceLastPromotion) OVER(PARTITION BY JobRole), 2) AS AvgYearsSincePromoRole,
    CASE
        WHEN YearsSinceLastPromotion > AVG(YearsSinceLastPromotion) OVER(PARTITION BY JobRole) + 2 THEN 'High Risk'
        WHEN YearsSinceLastPromotion > AVG(YearsSinceLastPromotion) OVER(PARTITION BY JobRole) THEN 'Above Average'
        ELSE 'Normal'
    END AS PromotionRisk
FROM hr_data;
"""

# 4. Attrition by Distance from Home — CTE
QUERY_DISTANCE_ATTRITION = """
WITH DistanceBuckets AS (
    SELECT
        CASE
            WHEN DistanceFromHome <= 5  THEN '1. Near (≤5 km)'
            WHEN DistanceFromHome <= 15 THEN '2. Moderate (6–15 km)'
            ELSE                             '3. Far (>15 km)'
        END AS DistanceCategory,
        Attrition
    FROM hr_data
)
SELECT
    DistanceCategory,
    COUNT(*) AS Total,
    SUM(CASE WHEN Attrition = 'Yes' THEN 1 ELSE 0 END) AS Attrited,
    ROUND(SUM(CASE WHEN Attrition = 'Yes' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS AttritionRate
FROM DistanceBuckets
GROUP BY DistanceCategory
ORDER BY DistanceCategory;
"""

# 5. Attrition by Age Group — CTE with window function for running total
QUERY_AGE_ATTRITION = """
WITH AgeBuckets AS (
    SELECT
        CASE
            WHEN Age < 25 THEN 'Under 25'
            WHEN Age < 35 THEN '25–34'
            WHEN Age < 45 THEN '35–44'
            WHEN Age < 55 THEN '45–54'
            ELSE               '55+'
        END AS AgeGroup,
        Attrition
    FROM hr_data
),
AgeStats AS (
    SELECT
        AgeGroup,
        COUNT(*) AS Total,
        SUM(CASE WHEN Attrition = 'Yes' THEN 1 ELSE 0 END) AS Attrited
    FROM AgeBuckets
    GROUP BY AgeGroup
)
SELECT
    AgeGroup,
    Total,
    Attrited,
    ROUND(Attrited * 100.0 / Total, 2) AS AttritionRate
FROM AgeStats
ORDER BY AgeGroup;
"""

# 6. Overtime vs. Attrition — Pivot-style CTE
QUERY_OVERTIME_ATTRITION = """
WITH OTStats AS (
    SELECT
        OverTime,
        COUNT(*) AS Total,
        SUM(CASE WHEN Attrition = 'Yes' THEN 1 ELSE 0 END) AS Attrited
    FROM hr_data
    GROUP BY OverTime
)
SELECT
    OverTime,
    Total,
    Attrited,
    Total - Attrited AS Retained,
    ROUND(Attrited * 100.0 / Total, 2) AS AttritionRate
FROM OTStats;
"""

# 7. Job Satisfaction vs. Attrition — Window average comparison
QUERY_SATISFACTION_ATTRITION = """
SELECT
    JobSatisfaction,
    COUNT(*) AS Total,
    SUM(CASE WHEN Attrition = 'Yes' THEN 1 ELSE 0 END) AS Attrited,
    ROUND(SUM(CASE WHEN Attrition = 'Yes' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS AttritionRate
FROM hr_data
GROUP BY JobSatisfaction
ORDER BY JobSatisfaction;
"""

# 8. Job Role Attrition — Window rank
QUERY_JOBROLE_ATTRITION = """
WITH RoleStats AS (
    SELECT
        JobRole,
        COUNT(*) AS Total,
        SUM(CASE WHEN Attrition = 'Yes' THEN 1 ELSE 0 END) AS Attrited
    FROM hr_data
    GROUP BY JobRole
)
SELECT
    JobRole,
    Total,
    Attrited,
    ROUND(Attrited * 100.0 / Total, 2) AS AttritionRate,
    RANK() OVER (ORDER BY ROUND(Attrited * 100.0 / Total, 2) DESC) AS RiskRank
FROM RoleStats
ORDER BY AttritionRate DESC;
"""
