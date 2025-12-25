
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import Loader from '../components/Loader';
import api from '../api/axios';
import { useAuth } from '../auth/AuthContext';

const StudentDashboard = () => {
  const [stats, setStats] = useState({ notes: 0, assignments: 0, announcements: 0 });
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [notesRes, assignmentsRes, announcementsRes] = await Promise.all([
        api.get('/notes'),
        api.get('/assignments'),
        api.get('/announcements'),
      ]);

      setStats({
        notes: notesRes.data.count || 0,
        assignments: assignmentsRes.data.count || 0,
        announcements: announcementsRes.data.count || 0,
      });

      setRecentAnnouncements(announcementsRes.data.data.announcements.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: 'text-red-400 bg-red-500/10 border-red-500/30',
      high: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
      medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
      low: 'text-green-400 bg-green-500/10 border-green-500/30',
    };
    return colors[priority] || colors.medium;
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {user?.name}!</h1>
              <p className="text-gray-400">Here's what's happening in your college</p>
            </div>

            {loading ? (
              <Loader />
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <StatCard title="Total Notes" value={stats.notes} icon="📚" color="blue" />
                  <StatCard title="Active Assignments" value={stats.assignments} icon="📝" color="green" />
                  <StatCard title="Announcements" value={stats.announcements} icon="📢" color="purple" />
                </div>

                <div className="card">
                  <h2 className="text-xl font-bold text-white mb-4">Recent Announcements</h2>
                  {recentAnnouncements.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No announcements yet</p>
                  ) : (
                    <div className="space-y-3">
                      {recentAnnouncements.map((announcement) => (
                        <div
                          key={announcement._id}
                          className="p-4 bg-dark-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-all duration-200"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-white">{announcement.title}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(announcement.priority)}`}>
                              {announcement.priority}
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm line-clamp-2">{announcement.content}</p>
                          <p className="text-gray-500 text-xs mt-2">
                            {new Date(announcement.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;