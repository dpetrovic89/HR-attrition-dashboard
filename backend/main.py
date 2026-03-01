from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import duckdb
import os
from sql_queries import (
    QUERY_DEPT_ATTRITION,
    QUERY_SALARY_BENCHMARK,
    QUERY_PROMOTION_ANALYSIS,
    QUERY_DISTANCE_ATTRITION,
    QUERY_AGE_ATTRITION,
    QUERY_OVERTIME_ATTRITION,
    QUERY_SATISFACTION_ATTRITION,
    QUERY_JOBROLE_ATTRITION,
)
from setup_data import generate_data

app = FastAPI(title="HR Attrition API")

@app.on_event("startup")
async def startup_event():
    if not os.path.exists(DB_PATH):
        print(f"Data file not found at {DB_PATH}. Generating dummy data...")
        # setup_data.py expects to be run from backend/ or root usually
        # but the function itself handles the directory creation.
        # However, setup_data.py uses "../data" relative to itself.
        # Let's just call the generation logic here to be safe.
        generate_data()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "..", "data", "hr_attrition.csv")


def run_query(query: str):
    if not os.path.exists(DB_PATH):
        raise HTTPException(status_code=500, detail="Data file not found. Run setup_data.py first.")
    con = duckdb.connect(database=":memory:")
    csv_path = DB_PATH.replace("\\", "/")
    con.execute(f"CREATE TABLE hr_data AS SELECT * FROM read_csv_auto('{csv_path}')")
    result = con.execute(query).fetchdf()
    con.close()
    return result.to_dict(orient="records")


@app.get("/api/health")
def health():
    return {"status": "ok"}

@app.get("/api/attrition/department")
def get_dept_attrition():
    return {"data": run_query(QUERY_DEPT_ATTRITION), "sql": QUERY_DEPT_ATTRITION}

@app.get("/api/attrition/salary")
def get_salary_benchmark():
    return {"data": run_query(QUERY_SALARY_BENCHMARK), "sql": QUERY_SALARY_BENCHMARK}

@app.get("/api/attrition/promotion")
def get_promotion_analysis():
    return {"data": run_query(QUERY_PROMOTION_ANALYSIS), "sql": QUERY_PROMOTION_ANALYSIS}

@app.get("/api/attrition/distance")
def get_distance_attrition():
    return {"data": run_query(QUERY_DISTANCE_ATTRITION), "sql": QUERY_DISTANCE_ATTRITION}

@app.get("/api/attrition/age")
def get_age_attrition():
    return {"data": run_query(QUERY_AGE_ATTRITION), "sql": QUERY_AGE_ATTRITION}

@app.get("/api/attrition/overtime")
def get_overtime_attrition():
    return {"data": run_query(QUERY_OVERTIME_ATTRITION), "sql": QUERY_OVERTIME_ATTRITION}

@app.get("/api/attrition/satisfaction")
def get_satisfaction_attrition():
    return {"data": run_query(QUERY_SATISFACTION_ATTRITION), "sql": QUERY_SATISFACTION_ATTRITION}

@app.get("/api/attrition/jobrole")
def get_jobrole_attrition():
    return {"data": run_query(QUERY_JOBROLE_ATTRITION), "sql": QUERY_JOBROLE_ATTRITION}


# Static files — mounted AFTER all API routes
_dist_paths = [
    os.path.join(BASE_DIR, "..", "frontend", "dist"),
    os.path.join(BASE_DIR, "frontend", "dist"),
]
for _p in _dist_paths:
    if os.path.exists(_p):
        app.mount("/", StaticFiles(directory=_p, html=True), name="static")
        break

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
