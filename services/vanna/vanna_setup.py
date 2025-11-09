import vanna as vn
from groq_chat import LocalContext_Groq
import os
from dotenv import load_dotenv
import psycopg
import pathlib

load_dotenv(dotenv_path=pathlib.Path(__file__).parent.parent.parent / 'apps' / 'api' / '.env')

DB_USER = "postgres_user"
DB_PASS = "my_strong_password"
DB_HOST = "localhost"
DB_PORT = 5432
DB_NAME = "flowbit_db"

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
if not GROQ_API_KEY:
    print("ERROR: GROQ_API_KEY not found. Please ensure it is in apps/api/.env file.")
    exit(1)

vanna_model_name = 'flowbit_vanna_model'
vn = LocalContext_Groq(config={
    'api_key': GROQ_API_KEY,
    'model': 'llama-3.1-8b-instant',
    'path': f'{vanna_model_name}.sqlite'
})

try:
    print("Connecting to PostgreSQL...")
    vn.connect_to_postgres(
        host=DB_HOST,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASS,
        port=DB_PORT
    )
except psycopg.OperationalError as e:
    print(f"ERROR: Could not connect to PostgreSQL database. Ensure Docker container is running. {e}")
    exit(1)
print(f"Vanna successfully connected to PostgreSQL on {DB_HOST}:{DB_NAME}")

print("Training Vanna on DDL schema for relationships...")

ddl_query = """
SELECT 
    tc.table_schema, 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name,
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type IN ('PRIMARY KEY', 'FOREIGN KEY')
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_type;
"""

try:
    ddl_df = vn.run_sql(ddl_query)
    ddl_text = ddl_df.to_markdown()
    vn.train(ddl=f"Primary keys and foreign keys in the database:\n{ddl_text}")
    print("✓ Trained on primary keys and foreign keys")
except Exception as e:
    print(f"⚠ Could not get primary/foreign key DDL: {e}")

try:
    invoices_sample = vn.run_sql("SELECT * FROM public.invoices LIMIT 1;")
    vn.train(ddl=f"Sample data from invoices table:\n{invoices_sample.to_markdown()}")
    print("✓ Trained on invoices table structure")
except Exception as e:
    print(f"⚠ Could not train on invoices table: {e}")

try:
    vendors_sample = vn.run_sql("SELECT * FROM public.vendors LIMIT 1;")
    vn.train(ddl=f"Sample data from vendors table:\n{vendors_sample.to_markdown()}")
    print("✓ Trained on vendors table structure")
except Exception as e:
    print(f"⚠ Could not train on vendors table: {e}")

print("Training Vanna with example questions...")
vn.train(
    question="What is the total spend for the current year?",
    sql="SELECT SUM(invoice_total) FROM invoices WHERE EXTRACT(YEAR FROM invoice_date) = EXTRACT(YEAR FROM CURRENT_DATE)"
)
vn.train(
    question="List the top 3 vendors by total invoice spend.",
    sql="""
        SELECT v.name, SUM(i.invoice_total) AS total_spend
        FROM invoices i JOIN vendors v ON i.vendor_id = v.id
        GROUP BY v.name
        ORDER BY total_spend DESC
        LIMIT 3
    """
)

print(f"\nTraining complete. Model saved locally as {vanna_model_name}.sqlite.")