import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// 根據環境設定 API 基礎 URL
const API_BASE_URL = 'https://img2markdown.onrender.com'    ;
// 'https://img2markdown.onrender.com'
// 'http://localhost:8000';

// 這是包住整個應用的元件，會提供整個 Context 給子元件使用
/*
1. App 啟動
2. AuthProvider 啟動 → useEffect 執行：
   - 有 token → 呼叫 /users/me → setUser
   - 沒 token → loading false
3. 任一頁面登入 → 呼叫 login(username, password)
   - 拿到 token 存起來
   - 呼叫 /users/me → 更新 user 狀態
4. 任一元件呼叫 useAuth()：
   - 就能取得 user、logout、loading、register 這些東西！
*/
export const AuthProvider = ({ children }) => { 
  const [user, setUser] = useState(null); 
  const [loading, setLoading] = useState(true); 
  // 進入頁面時
  useEffect(() => {
    // 檢查本地是否有存 token
    const token = localStorage.getItem('token');
    if (token) {
      // 有的話自動加到 axios 的 Header(axios 是用來在瀏覽器或 Node.js 中發送 HTTP 請求)，讓全部請求都帶上
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // 獲取用戶信息
      fetchUserInfo();
    } else {
      // 未登入
      setLoading(false);
    }
  }, []);
  
  
  const fetchUserInfo = async () => {
    try {
      // 呼叫後端的 /users/me API 來取得目前的使用者資訊
      const response = await axios.get(`${API_BASE_URL}/users/me`);
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user info:', error);
      // 若 token 錯誤或過期 → 登出（清除 token、Header）
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);

      const response = await axios.post(`${API_BASE_URL}/token`, formData);
      const { access_token } = response.data;

      localStorage.setItem('token', access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      await fetchUserInfo();
      return true;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email, username, password) => {
    try {
      await axios.post(`${API_BASE_URL}/register`, {
        email,
        username,
        password,
      });
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
// 取得使用者資訊
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 