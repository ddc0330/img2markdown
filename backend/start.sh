#!/bin/bash
cd backend  # 確保進入 backend 資料夾
uvicorn main:app --host 0.0.0.0 --port 10000