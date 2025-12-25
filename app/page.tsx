'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface Schedule {
  id: string;
  time: string;
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
}

interface VideoTrend {
  title: string;
  category: string;
  keywords: string[];
}

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [channelInfo, setChannelInfo] = useState<any>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [newScheduleTime, setNewScheduleTime] = useState('09:00');
  const [trends, setTrends] = useState<VideoTrend[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    checkAuth();
    loadSchedules();
    loadTrends();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get('/api/auth/status');
      setIsAuthenticated(response.data.authenticated);
      if (response.data.authenticated) {
        setChannelInfo(response.data.channel);
      }
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  const loadSchedules = async () => {
    try {
      const response = await axios.get('/api/schedules');
      setSchedules(response.data.schedules || []);
    } catch (error) {
      console.error('Failed to load schedules:', error);
    }
  };

  const loadTrends = async () => {
    try {
      const response = await axios.get('/api/trends');
      setTrends(response.data.trends || []);
    } catch (error) {
      console.error('Failed to load trends:', error);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/login';
  };

  const handleLogout = async () => {
    await axios.post('/api/auth/logout');
    setIsAuthenticated(false);
    setChannelInfo(null);
  };

  const addSchedule = async () => {
    try {
      const response = await axios.post('/api/schedules', {
        time: newScheduleTime,
      });
      setSchedules(response.data.schedules);
      setNewScheduleTime('09:00');
    } catch (error) {
      alert('Failed to add schedule');
    }
  };

  const toggleSchedule = async (id: string, enabled: boolean) => {
    try {
      const response = await axios.put(`/api/schedules/${id}`, {
        enabled: !enabled,
      });
      setSchedules(response.data.schedules);
    } catch (error) {
      alert('Failed to update schedule');
    }
  };

  const deleteSchedule = async (id: string) => {
    try {
      const response = await axios.delete(`/api/schedules/${id}`);
      setSchedules(response.data.schedules);
    } catch (error) {
      alert('Failed to delete schedule');
    }
  };

  const generateVideoNow = async () => {
    if (!confirm('Generate and upload a video now? This may take several minutes.')) {
      return;
    }

    setIsGenerating(true);
    setLogs([]);

    try {
      const response = await axios.post('/api/generate-video');
      setLogs(response.data.logs || []);
      alert('Video generated and uploaded successfully!');
    } catch (error: any) {
      alert('Failed to generate video: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsGenerating(false);
    }
  };

  const refreshTrends = async () => {
    try {
      const response = await axios.post('/api/trends/refresh');
      setTrends(response.data.trends || []);
    } catch (error) {
      alert('Failed to refresh trends');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            YouTube Automation Agent
          </h1>
          <p className="text-xl text-gray-600">
            Automated video creation and scheduled posting
          </p>
        </div>

        {!isAuthenticated ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto">
            <div className="text-center">
              <svg className="mx-auto h-16 w-16 text-red-500 mb-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Connect Your YouTube Channel
              </h2>
              <p className="text-gray-600 mb-6">
                Sign in with Google to start automating your video uploads
              </p>
              <button
                onClick={handleGoogleLogin}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Channel Info */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {channelInfo?.thumbnail && (
                    <img
                      src={channelInfo.thumbnail}
                      alt="Channel"
                      className="w-16 h-16 rounded-full"
                    />
                  )}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {channelInfo?.title || 'YouTube Channel'}
                    </h2>
                    <p className="text-gray-600">
                      {channelInfo?.subscriberCount || '0'} subscribers
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-200"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* Generate Video Now */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Generate Video
              </h2>
              <p className="text-gray-600 mb-4">
                Create and upload a video immediately based on current trends
              </p>
              <button
                onClick={generateVideoNow}
                disabled={isGenerating}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
              >
                {isGenerating ? 'Generating...' : 'Generate Video Now'}
              </button>
              {logs.length > 0 && (
                <div className="mt-4 bg-gray-100 rounded-lg p-4 max-h-48 overflow-y-auto">
                  {logs.map((log, index) => (
                    <div key={index} className="text-sm text-gray-700 mb-1">
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Trending Topics */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  Trending Topics
                </h2>
                <button
                  onClick={refreshTrends}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                >
                  Refresh
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trends.map((trend, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-200"
                  >
                    <h3 className="font-bold text-gray-900 mb-2">{trend.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{trend.category}</p>
                    <div className="flex flex-wrap gap-2">
                      {trend.keywords.slice(0, 3).map((keyword, i) => (
                        <span
                          key={i}
                          className="bg-purple-100 text-purple-800 text-xs font-semibold px-2 py-1 rounded"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Schedules */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Upload Schedules
              </h2>

              <div className="mb-6 flex gap-4">
                <input
                  type="time"
                  value={newScheduleTime}
                  onChange={(e) => setNewScheduleTime(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={addSchedule}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition duration-200"
                >
                  Add Schedule
                </button>
              </div>

              <div className="space-y-3">
                {schedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => toggleSchedule(schedule.id, schedule.enabled)}
                        className={`w-12 h-6 rounded-full transition duration-200 ${
                          schedule.enabled ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white transform transition duration-200 ${
                            schedule.enabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <div>
                        <div className="font-bold text-gray-900">
                          {schedule.time} (Daily)
                        </div>
                        {schedule.nextRun && (
                          <div className="text-sm text-gray-600">
                            Next run: {new Date(schedule.nextRun).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteSchedule(schedule.id)}
                      className="text-red-600 hover:text-red-800 font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                ))}
                {schedules.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No schedules configured. Add one above to automate your uploads.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
