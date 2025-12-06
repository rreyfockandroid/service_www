from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import RealDictCursor
import os

app = FastAPI()
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = "your-secret-key-change-in-production-12345"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

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

class LoginRequest(BaseModel):
    username: str
    password: str

class ArticleCreate(BaseModel):
    title: str
    content: str
    slug: str
    section_id: int
    level: str

class ArticleUpdate(BaseModel):
    title: str
    content: str
    level: str

class ContactForm(BaseModel):
    name: str
    email: str
    message: str

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Nieprawidłowy token")
        return username
    except JWTError:
        raise HTTPException(status_code=401, detail="Nieprawidłowy token")

@app.post("/api/auth/login")
def login(request: LoginRequest):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM users WHERE username = %s", (request.username,))
    user = cur.fetchone()
    cur.close()
    conn.close()
    
    if not user:
        raise HTTPException(status_code=401, detail="Nieprawidłowa nazwa użytkownika lub hasło")
    
    if not pwd_context.verify(request.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Nieprawidłowa nazwa użytkownika lub hasło")
    
    access_token = create_access_token(data={"sub": user['username']})
    return {"access_token": access_token, "token_type": "bearer", "is_admin": user['is_admin']}

@app.get("/api/auth/verify")
def verify(username: str = Depends(verify_token)):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT is_admin FROM users WHERE username = %s", (username,))
    user = cur.fetchone()
    cur.close()
    conn.close()
    
    if not user:
        raise HTTPException(status_code=404, detail="Użytkownik nie znaleziony")
    
    return {"username": username, "is_admin": user['is_admin']}

@app.get("/")
def root():
    return {"message": "Backend API fizyki działa"}

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

@app.get("/api/articles")
def get_articles(level: str = None):
    conn = get_db()
    cur = conn.cursor()
    if level:
        cur.execute("SELECT * FROM articles WHERE level = %s ORDER BY id", (level,))
    else:
        cur.execute("SELECT * FROM articles ORDER BY id")
    articles = cur.fetchall()
    cur.close()
    conn.close()
    return articles

@app.get("/api/articles/{slug}")
def get_article(slug: str):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM articles WHERE slug = %s", (slug,))
    article = cur.fetchone()
    cur.close()
    conn.close()
    if not article:
        raise HTTPException(status_code=404, detail="Artykuł nie znaleziony")
    return article

@app.post("/api/articles")
def create_article(article: ArticleCreate, username: str = Depends(verify_token)):
    conn = get_db()
    cur = conn.cursor()
    
    cur.execute("SELECT is_admin FROM users WHERE username = %s", (username,))
    user = cur.fetchone()
    if not user or not user['is_admin']:
        cur.close()
        conn.close()
        raise HTTPException(status_code=403, detail="Brak uprawnień")
    
    cur.execute(
        "INSERT INTO articles (title, content, slug, section_id, level) VALUES (%s, %s, %s, %s, %s) RETURNING id",
        (article.title, article.content, article.slug, article.section_id, article.level)
    )
    article_id = cur.fetchone()['id']
    conn.commit()
    cur.close()
    conn.close()
    return {"message": "Artykuł dodany", "id": article_id}

@app.put("/api/articles/{article_id}")
def update_article(article_id: int, article: ArticleUpdate, username: str = Depends(verify_token)):
    conn = get_db()
    cur = conn.cursor()
    
    cur.execute("SELECT is_admin FROM users WHERE username = %s", (username,))
    user = cur.fetchone()
    if not user or not user['is_admin']:
        cur.close()
        conn.close()
        raise HTTPException(status_code=403, detail="Brak uprawnień")
    
    cur.execute(
        "UPDATE articles SET title = %s, content = %s, level = %s WHERE id = %s",
        (article.title, article.content, article.level, article_id)
    )
    conn.commit()
    cur.close()
    conn.close()
    return {"message": "Artykuł zaktualizowany"}

@app.delete("/api/articles/{article_id}")
def delete_article(article_id: int, username: str = Depends(verify_token)):
    conn = get_db()
    cur = conn.cursor()
    
    cur.execute("SELECT is_admin FROM users WHERE username = %s", (username,))
    user = cur.fetchone()
    if not user or not user['is_admin']:
        cur.close()
        conn.close()
        raise HTTPException(status_code=403, detail="Brak uprawnień")
    
    cur.execute("DELETE FROM articles WHERE id = %s", (article_id,))
    conn.commit()
    cur.close()
    conn.close()
    return {"message": "Artykuł usunięty"}

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