from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import vanna as vn
from groq_chat import LocalContext_Groq
from dotenv import load_dotenv
import pathlib
import pandas as pd
import psycopg

load_dotenv(dotenv_path=pathlib.Path(__file__).parent.parent.parent / 'apps' / 'api' / '.env')

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
vanna_model_name = 'flowbit_vanna_model'
DB_USER = os.getenv("DB_USER", "postgres_user")
DB_PASS = os.getenv("DB_PASSWORD", "my_strong_password")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", "5432"))
DB_NAME = os.getenv("DB_NAME", "flowbit_db")

vn = LocalContext_Groq(config={
    'api_key': GROQ_API_KEY,
    'model': 'llama-3.1-8b-instant',
    'path': f'{vanna_model_name}.sqlite'
})

try:
    print("Connecting Vanna to PostgreSQL...")
    vn.connect_to_postgres(
        host=DB_HOST,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASS,
        port=DB_PORT
    )
    print(f"✓ Vanna connected to PostgreSQL at {DB_HOST}:{DB_NAME}")
except Exception as e:
    print(f"⚠ Warning: Could not connect to PostgreSQL: {e}")
    print("Vanna will still start but SQL execution will fail until database is connected.")

app = FastAPI(
    title="Flowbit Vanna AI API",
    description="Backend service for natural language to SQL analytics.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    query: str

class QueryResponse(BaseModel):
    sql: str
    results: list
    message: str

@app.post("/vanna/ask", response_model=QueryResponse)
async def ask_vanna(request: QueryRequest):
    try:
        sql_query = vn.generate_sql(request.query, auto_train=True)

        if not sql_query:
            return QueryResponse(sql="", results=[], message="Vanna could not generate a SQL query for that question.")

        results_df: pd.DataFrame = vn.run_sql(sql_query)
        results_list = results_df.to_dict('records')

        return QueryResponse(
            sql=sql_query,
            results=results_list,
            message="Query successful"
        )
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error during Vanna processing: {e}")
        print(f"Full traceback:\n{error_trace}")
        raise HTTPException(status_code=500, detail=f"Vanna execution error: {str(e)}")

@app.get("/status")
async def get_status():
    return {"status": "Vanna AI Service Operational", "model": vanna_model_name}