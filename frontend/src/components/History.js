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
  const [expandedStates, setExpandedStates] = useState({});
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
      // 初始化展開狀態
      const initialStates = {};
      response.data.forEach(history => {
        initialStates[history.id] = {
          source: false,
          preview: false
        };
      });
      setExpandedStates(initialStates);
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

  const toggleExpand = (historyId, type) => {
    setExpandedStates(prev => ({
      ...prev,
      [historyId]: {
        ...prev[historyId],
        [type]: !prev[historyId][type]
      }
    }));
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
                <div className="w-8 h-8 flex items-center justify-center bg-primary-100 text-primary-600 rounded">
                  <img src="/favicon.ico" alt="Logo" className="h-full w-full object-contain" />
                </div>
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
                <svg class="navbar-icon w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H8m12 0-4 4m4-4-4-4M9 4H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h2"/>
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
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleExpand(history.id, 'source')}
                          className={`px-3 py-1.5 rounded-lg transition-colors text-sm font-medium ${
                            expandedStates[history.id]?.source
                              ? 'bg-gray-200 text-gray-700'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {expandedStates[history.id]?.source ? 'Hide Source' : 'Show Source'}
                        </button>
                        <button
                          onClick={() => toggleExpand(history.id, 'preview')}
                          className={`px-3 py-1.5 rounded-lg transition-colors text-sm font-medium ${
                            expandedStates[history.id]?.preview
                              ? 'bg-gray-200 text-gray-700'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {expandedStates[history.id]?.preview ? 'Hide Preview' : 'Show Preview'}
                        </button>
                        <button
                          onClick={() => handleDelete(history.id)}
                          className="px-3 py-1.5 bg-rose-50 text-rose-700 rounded-lg hover:bg-rose-100 transition-colors text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
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
                  
                  {expandedStates[history.id]?.source && (
                    <div className="px-6 py-4 border-t border-gray-100">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Markdown Source</h3>
                      <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
                        {history.markdown_content}
                      </pre>
                    </div>
                  )}
                  
                  {expandedStates[history.id]?.preview && (
                    <div className="px-6 py-4 border-t border-gray-100">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Preview</h3>
                      <div className="prose max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {history.markdown_content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
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