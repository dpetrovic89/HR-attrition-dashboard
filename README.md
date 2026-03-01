---
title: HR Attrition SQL Showcase
emoji: 📊
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
app_port: 7860
---

# HR Attrition Dashboard — SQL Showcase

A modern, interactive HR Analytics Dashboard built to showcase **advanced SQL techniques** (CTEs and Window Functions) using **DuckDB**, **FastAPI**, and **React**.

> 🎓 Built as a **resume/CV portfolio project** — highlighting both data engineering and full-stack skills.

## 🚀 Features

| Feature | Details |
|---|---|
| 🧠 **SQL Explorer** | Click any chart to reveal the CTE or Window Function that drives it |
| ⚡ **DuckDB Engine** | High-performance in-process SQL directly on CSV data |
| 📊 **8 Interactive Charts** | Bars, area charts, pie/donut, line, horizontal bars |
| 🎨 **Premium UI** | Glassmorphism dark-mode, Recharts, animated spinner |
| 🐳 **Docker ready** | Ships with a multi-stage Dockerfile for Hugging Face Spaces |

## 📖 SQL Highlights

### CTE — Department Attrition vs. Company Average
```sql
WITH DeptStats AS (
    SELECT Department,
           COUNT(*) AS TotalEmployees,
           SUM(CASE WHEN Attrition = 'Yes' THEN 1 ELSE 0 END) AS AttritionCount
    FROM hr_data GROUP BY Department
),
CompanyAvg AS (
    SELECT CAST(SUM(AttritionCount) AS FLOAT) / SUM(TotalEmployees) AS AvgRate
    FROM DeptStats
)
SELECT d.Department,
       ROUND(d.AttritionCount * 100.0 / d.TotalEmployees, 2) AS DeptAttritionRate,
       ROUND(c.AvgRate * 100, 2) AS CompanyAvgRate
FROM DeptStats d, CompanyAvg c;
```

### Window Function — Salary Percentile Benchmarking
```sql
SELECT EmployeeID, Department, MonthlyIncome,
       AVG(MonthlyIncome) OVER(PARTITION BY Department) AS DeptAvgSalary,
       PERCENT_RANK() OVER(PARTITION BY Department ORDER BY MonthlyIncome) AS SalaryPercentile
FROM hr_data;
```

### Window Function — Promotion Risk Scoring
```sql
SELECT EmployeeID, JobRole, YearsSinceLastPromotion,
       CASE
           WHEN YearsSinceLastPromotion > AVG(YearsSinceLastPromotion) OVER(PARTITION BY JobRole) + 2
               THEN 'High Risk'
           WHEN YearsSinceLastPromotion > AVG(YearsSinceLastPromotion) OVER(PARTITION BY JobRole)
               THEN 'Above Average'
           ELSE 'Normal'
       END AS PromotionRisk
FROM hr_data;
```

## 🛠️ Tech Stack

**Backend** · FastAPI · DuckDB · Pandas · Python 3.11  
**Frontend** · React + Vite · Recharts · Lucide-React · Vanilla CSS  
**Deployment** · Docker · Hugging Face Spaces  

## 🏃 Local Setup

```bash
# 1. Backend
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python setup_data.py        # generates data/hr_attrition.csv
uvicorn main:app --reload   # → http://localhost:8000

# 2. Frontend (new terminal)
cd frontend
npm install
npm run dev                 # → http://localhost:5173
```

## 🐳 Docker

```bash
docker build -t hr-dashboard .
docker run -p 7860:7860 hr-dashboard
# Open http://localhost:7860
```

## 📂 Project Structure

```
HR-attrition_dashboard/
├── backend/
│   ├── main.py           # FastAPI + DuckDB
│   ├── sql_queries.py    # 8 CTE & Window Function queries
│   ├── setup_data.py     # Generates dataset
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── App.jsx       # Dashboard (8 charts + SQL Explorer)
│       └── index.css     # Glassmorphism dark theme
├── data/                 # Auto-generated – not in git
├── Dockerfile
└── README.md
```

## 📜 License

MIT — free to use, fork, and adapt for your own portfolio.
