import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const API_BASE_URL = 'https://img2markdown.onrender.com' ;
//'https://img2markdown.onrender.com' 
//'http://localhost:8000'
function History() {
  const [histories, setHistories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchHistories();
  }, []);

  const fetchHistories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setHistories(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch history');
      setLoading(false);
    }
  };

  const handleDelete = async (historyId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/history/${historyId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      // 重新獲取歷史紀錄
      fetchHistories();
    } catch (err) {
      setError('Failed to delete history item');
    }
  };

  // 轉換時間為 GMT+8 格式
  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString.endsWith('Z') ? dateTimeString : dateTimeString + 'Z');  // 加 Z 是關鍵！
    const options = { 
      timeZone: 'Asia/Taipei',
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    };    
    return date.toLocaleString('zh-TW', options);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
    </div>
  );
  
  if (error) return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="bg-rose-50 text-rose-700 p-6 rounded-lg max-w-md">
        <h3 className="font-medium text-lg mb-2">Error</h3>
        <p>{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-white">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-container px-4">
          <div className="navbar-content">
            {/* Left: Logo and Title */}
            <div className="navbar-brand">
              <div className="w-8 h-8 flex items-center justify-center bg-primary-100 text-primary-600 rounded">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 18H17V16H7V18Z" fill="currentColor" />
                  <path d="M17 14H7V12H17V14Z" fill="currentColor" />
                  <path d="M7 10H11V8H7V10Z" fill="currentColor" />
                  <path fillRule="evenodd" clipRule="evenodd" d="M6 2C4.34315 2 3 3.34315 3 5V19C3 20.6569 4.34315 22 6 22H18C19.6569 22 21 20.6569 21 19V9C21 5.13401 17.866 2 14 2H6ZM5 5C5 4.44772 5.44772 4 6 4H14C16.7614 4 19 6.23858 19 9V19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V5Z" fill="currentColor" />
                </svg>
              </div>
              <h1 className="navbar-title">
                History
              </h1>
            </div>

            {/* Right: User Info and Controls */}
            {user && (
            <div className="navbar-menu h-full">
              <span className="flex-grow h-full flex items-center px-4 text-gray-700">
                Welcome, {user.username}
              </span>
              <Link to="/" className="navbar-item">
                <svg className="navbar-icon h-full" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L10 4.414l6.293 6.293a1 1 0 001.414-1.414l-7-7z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M10 18a1 1 0 01-1-1v-8a1 1 0 112 0v8a1 1 0 01-1 1z" clipRule="evenodd" />
                </svg>
                Home
              </Link>
              <button onClick={logout} className="navbar-item">
                <svg className="navbar-icon h-full" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-5-5H3zM2 4a2 2 0 012-2h6.586a1 1 0 01.707.293l6.414 6.414a1 1 0 01.293.707V16a2 2 0 01-2 2H4a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M10 12a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Logout
              </button>
            </div>
            )}
          </div>
        </div>
      </nav>

      {/* 主要內容 */}
      <div className="w-full">
        <div className="bg-white p-4 md:p-6">
          {histories.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">No history record</h3>
              <p className="text-gray-600">You haven't converted any content</p>
            </div>
          ) : (
            <div className="space-y-8">
              {histories.map((history) => (
                <div key={history.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex flex-wrap justify-between items-center">
                      <div className="flex items-center space-x-4 mb-2 md:mb-0">
                        <span className="text-sm text-gray-600">
                          {formatDateTime(history.created_at)}
                        </span>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          history.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                          history.status === 'processing' ? 'bg-amber-100 text-amber-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {history.status}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDelete(history.id)}
                        className="px-3 py-1.5 bg-rose-50 text-rose-700 rounded-lg hover:bg-rose-100 transition-colors text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  {history.image_url && history.image_url !== 'image.png' && (
                    <div className="px-6 pt-4">
                      <div className="rounded-lg overflow-hidden border border-gray-100">
                        <img 
                          src={history.image_url} 
                          alt="Converted content" 
                          className="w-full h-auto object-cover"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="px-6 py-4">
                    <div className="prose max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {history.markdown_content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default History; 