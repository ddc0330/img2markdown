from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from database import Base

# 定義一張名為 users 的資料表，用來儲存使用者的帳號資訊
# 這使用了 ORM 的框架，將一個表格與 python 類別對應
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True)
    username = Column(String(255), unique=True, index=True)
    hashed_password = Column(String(255))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now()) 