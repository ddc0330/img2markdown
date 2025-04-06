from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# 從環境變數獲取資料庫 URL
DATABASE_URL = os.getenv("DATABASE_URL")

# 如果使用 Railway，需要將 URL 中的 postgres:// 替換為 mysql+pymysql://
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "mysql+pymysql://", 1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# 依賴注入
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 