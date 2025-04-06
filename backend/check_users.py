from sqlalchemy.orm import Session
from database import SessionLocal
import models

def get_all_users():
    db = SessionLocal()
    try:
        users = db.query(models.User).all()
        print("\n=== 用戶列表 ===")
        for user in users:
            print(f"\n用戶 ID: {user.id}")
            print(f"用戶名: {user.username}")
            print(f"電子郵件: {user.email}")
            print(f"創建時間: {user.created_at}")
            print("-" * 30)
    finally:
        db.close()

if __name__ == "__main__":
    get_all_users() 