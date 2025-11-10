from typing import Any, List, Dict
import logging
import traceback

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import pandas as pd

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="Flowbit Vanna AI API",
    description="Backend service for natural language to SQL analytics.",
    version="1.0.0",
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
    results: List[Dict[str, Any]]
    message: str

# Vanna client will be initialized on startup to avoid import-time failures on Render
vn: Any = None
vanna_model_name: str | None = None


@app.on_event("startup")
async def startup_event():
    global vn, vanna_model_name
    try:
        # Import inside startup so heavy imports (vanna, groq, DB clients) don't run at module import
        from .vanna_setup import initialize_vanna, vanna_model_name as _vn_name

        result = initialize_vanna()
        if isinstance(result, tuple):
            vn, maybe_name = result
            vanna_model_name = maybe_name or _vn_name
        else:
            vn = result
            vanna_model_name = _vn_name

        logger.info("Vanna initialized on startup. model=%s", vanna_model_name)
    except Exception as e:
        logger.exception("Failed to initialize Vanna on startup: %s", e)
        # keep service up; endpoints will return 503 until vn is ready


@app.post("/vanna/ask", response_model=QueryResponse)
async def ask_vanna(request: QueryRequest):
    if vn is None:
        raise HTTPException(status_code=503, detail="Service initializing or database not connected")

    try:
        # Generate SQL from natural language
        if hasattr(vn, "generate_sql"):
            sql_query = vn.generate_sql(request.query, auto_train=True)
        elif hasattr(vn, "nl_to_sql"):
            sql_query = vn.nl_to_sql(request.query)
        else:
            raise RuntimeError("Vanna client does not expose a SQL generation method")

        if not sql_query:
            return QueryResponse(sql="", results=[], message="Vanna could not generate a SQL query for that question.")

        # Execute SQL
        if hasattr(vn, "run_sql"):
            results = vn.run_sql(sql_query)
        elif hasattr(vn, "execute_sql"):
            results = vn.execute_sql(sql_query)
        else:
            raise RuntimeError("Vanna client does not expose a SQL execution method")

        # normalize results to list[dict]
        if isinstance(results, pd.DataFrame):
            results_list = results.to_dict("records")
        elif isinstance(results, list):
            results_list = results
        else:
            try:
                results_list = list(results)
            except Exception:
                results_list = [{"result": str(results)}]

        return QueryResponse(sql=sql_query, results=results_list, message="Query successful")
    except Exception as e:
        logger.error("Error processing query: %s\n%s", e, traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/status")
async def get_status():
    try:
        return JSONResponse({
            "status": "operational" if vn is not None else "initializing",
            "model": vanna_model_name or "unknown",
        })
    except Exception as e:
        logger.error("Health check error: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


# lightweight root endpoint
@app.get("/")
async def root():
    return {"service": "flowbit-vanna", "status": "ok", "model": vanna_model_name or "unknown"}