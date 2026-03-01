---
title: HR Attrition Dashboard — SQL Showcase
emoji: 📊
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
app_port: 7860
---

# 📊 HR Attrition Analytics Dashboard

[![Sync to Hugging Face Spaces](https://github.com/dpetrovic89/HR-attrition-dashboard/actions/workflows/sync_to_hf.yml/badge.svg)](https://github.com/dpetrovic89/HR-attrition-dashboard/actions/workflows/sync_to_hf.yml)
[![Hugging Face Spaces](https://img.shields.io/badge/%F0%9F%A4%97%20Hugging%20Face-Spaces-blue)](https://huggingface.co/spaces/executor1389/HR-attrition-dashboard)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

### **[Live Demo: huggingface.co/spaces/executor1389/HR-attrition-dashboard](https://huggingface.co/spaces/executor1389/HR-attrition-dashboard)**

A premium, interactive HR Analytics Dashboard designed to visualize employee turnover insights using **Advanced SQL** (CTEs & Window Functions). Powered by **DuckDB** for lightning-fast in-browser queries and **FastAPI** + **React**.

---

## ✨ Key Features

*   🔍 **SQL Explorer**: Interactive mode to inspect the exact SQL queries driving each visualization.
*   ⚡ **DuckDB Powered**: High-performance analytical SQL execution directly on CSV data.
*   📊 **8+ Dynamic Charts**: Comprehensive metrics including Department Attrition, Salary Distribution, and Promotion Risk.
*   🎨 **Glassmorphism UI**: Modern dark-mode interface with smooth animations and responsive design.
*   🐳 **Containerized**: Fully Dockerized for seamless deployment to Hugging Face Spaces.

---

## � Advanced SQL Showcase

This project explicitly demonstrates mastery of intermediate-to-advanced SQL patterns:

<details>
<summary><b>1. CTEs: Department Attrition vs. Global Average</b></summary>

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
</details>

<details>
<summary><b>2. Window Functions: Salary Percentile Benchmarking</b></summary>

```sql
SELECT EmployeeID, Department, MonthlyIncome,
       AVG(MonthlyIncome) OVER(PARTITION BY Department) AS DeptAvgSalary,
       PERCENT_RANK() OVER(PARTITION BY Department ORDER BY MonthlyIncome) AS SalaryPercentile
FROM hr_data;
```
</details>

<details>
<summary><b>3. Logic: Promotion Risk Scoring</b></summary>

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
</details>

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Backend** | ![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat&logo=fastapi) ![DuckDB](https://img.shields.io/badge/DuckDB-FFF000?style=flat&logo=duckdb&logoColor=black) ![Pandas](https://img.shields.io/badge/Pandas-150458?style=flat&logo=pandas) |
| **Frontend** | ![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite) ![Recharts](https://img.shields.io/badge/Recharts-222222?style=flat) |
| **DevOps** | ![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker) ![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat&logo=github-actions) |

---

## 🚀 Quick Start

### Local Development

1. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Windows: .\venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Using Docker
```bash
docker build -t hr-dashboard .
docker run -p 7860:7860 hr-dashboard
```

---

## 📂 Project Structure

```bash
.
├── backend/            # FastAPI API & DuckDB Logic
├── frontend/           # Vite + React Dashboard
├── data/               # HR Dataset (Auto-generated)
├── .github/workflows/  # CI/CD (Auto-sync to HF)
└── Dockerfile          # Multi-stage production build
```

---

## 📜 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
