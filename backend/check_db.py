import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
import sys

# 載入環境變數
load_dotenv()

# 直接使用完整的資料庫 URL
DATABASE_URL = os.getenv("DATABASE_URL")

try:
    # 創建引擎
    engine = create_engine(DATABASE_URL)
    
    # 測試連接
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        print("\n資料庫連接成功!")
        
        # 檢查資料表是否存在
        result = connection.execute(text("SHOW TABLES"))
        tables = [row[0] for row in result]
        
        if tables:
            print(f"資料庫中的表格: {', '.join(tables)}")
        else:
            print("資料庫中沒有表格")
            
except Exception as e:
    print(f"\n資料庫連接失敗: {str(e)}")
    sys.exit(1) 