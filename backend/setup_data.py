import pandas as pd
import numpy as np
import os

def generate_data():
    np.random.seed(42)
    n = 1470
    data = {
        'EmployeeID': range(1, n + 1),
        'Age': np.random.randint(18, 60, n),
        'Attrition': np.random.choice(['Yes', 'No'], n, p=[0.16, 0.84]),
        'BusinessTravel': np.random.choice(['Travel_Rarely', 'Travel_Frequently', 'Non-Travel'], n),
        'DailyRate': np.random.randint(100, 1500, n),
        'Department': np.random.choice(['Sales', 'Research & Development', 'Human Resources'], n),
        'DistanceFromHome': np.random.randint(1, 30, n),
        'Education': np.random.randint(1, 6, n),
        'EducationField': np.random.choice(['Life Sciences', 'Medical', 'Marketing', 'Technical Degree', 'Other'], n),
        'EnvironmentSatisfaction': np.random.randint(1, 5, n),
        'Gender': np.random.choice(['Male', 'Female'], n),
        'HourlyRate': np.random.randint(30, 100, n),
        'JobInvolvement': np.random.randint(1, 5, n),
        'JobLevel': np.random.randint(1, 6, n),
        'JobRole': np.random.choice(['Sales Executive', 'Research Scientist', 'Laboratory Technician', 'Manufacturing Director', 'Healthcare Representative', 'Manager', 'Sales Representative', 'Research Director', 'Human Resources'], n),
        'JobSatisfaction': np.random.randint(1, 5, n),
        'MaritalStatus': np.random.choice(['Single', 'Married', 'Divorced'], n),
        'MonthlyIncome': np.random.randint(1000, 20000, n),
        'MonthlyRate': np.random.randint(2000, 27000, n),
        'NumCompaniesWorked': np.random.randint(0, 10, n),
        'OverTime': np.random.choice(['Yes', 'No'], n),
        'PercentSalaryHike': np.random.randint(11, 26, n),
        'PerformanceRating': np.random.choice([3, 4], n, p=[0.85, 0.15]),
        'RelationshipSatisfaction': np.random.randint(1, 5, n),
        'StandardHours': [80] * n,
        'StockOptionLevel': np.random.randint(0, 4, n),
        'TotalWorkingYears': np.random.randint(0, 41, n),
        'TrainingTimesLastYear': np.random.randint(0, 7, n),
        'WorkLifeBalance': np.random.randint(1, 5, n),
        'YearsAtCompany': np.random.randint(0, 41, n),
        'YearsInCurrentRole': np.random.randint(0, 19, n),
        'YearsSinceLastPromotion': np.random.randint(0, 16, n),
        'YearsWithCurrManager': np.random.randint(0, 18, n)
    }
    df = pd.DataFrame(data)
    os.makedirs("../data", exist_ok=True)
    df.to_csv("../data/hr_attrition.csv", index=False)
    print("Dummy data generated and saved to ../data/hr_attrition.csv")

if __name__ == "__main__":
    try:
        url = "https://raw.githubusercontent.com/davide97l/IBM-HR-Analytics-Employee-Attrition-Performance/master/WA_Fn-UseC_-HR-Employee-Attrition.csv"
        print(f"Attempting to download data from {url}...")
        df = pd.read_csv(url)
        os.makedirs("../data", exist_ok=True)
        df.to_csv("../data/hr_attrition.csv", index=False)
        print("Data downloaded successfully.")
    except Exception as e:
        print(f"Download failed: {e}. Generating dummy data instead.")
        generate_data()
