from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import psycopg2
from psycopg2.extras import RealDictCursor
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    return psycopg2.connect(
        os.getenv("DATABASE_URL"),
        cursor_factory=RealDictCursor
    )

class ContactForm(BaseModel):
    name: str
    email: str
    message: str

@app.get("/")
def root():
    return {"message": "Backend API działa"}

@app.get("/api/sections")
def get_sections():
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM sections ORDER BY order_num")
    sections = cur.fetchall()
    cur.close()
    conn.close()
    return sections

@app.get("/api/sections/{slug}")
def get_section(slug: str):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM sections WHERE slug = %s", (slug,))
    section = cur.fetchone()
    cur.close()
    conn.close()
    if not section:
        raise HTTPException(status_code=404, detail="Sekcja nie znaleziona")
    return section

@app.post("/api/contact")
def submit_contact(form: ContactForm):
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO contacts (name, email, message) VALUES (%s, %s, %s) RETURNING id",
        (form.name, form.email, form.message)
    )
    contact_id = cur.fetchone()["id"]
    conn.commit()
    cur.close()
    conn.close()
    return {"message": "Wiadomość wysłana", "id": contact_id}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)