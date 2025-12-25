
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import Loader from '../components/Loader';
import api from '../api/axios';
import { useAuth } from '../auth/AuthContext';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ notes: 0, assignments: 0, announcements: 0, subjects: 0 });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [notesRes, assignmentsRes, announcementsRes, subjectsRes] = await Promise.all([
        api.get('/notes'),
        api.get('/assignments'),
        api.get('/announcements'),
        api.get('/admin/subjects'),
      ]);

      setStats({
        notes: notesRes.data.count || 0,
        assignments: assignmentsRes.data.count || 0,
        announcements: announcementsRes.data.count || 0,
        subjects: subjectsRes.data.count || 0,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
              <p className="text-gray-400">Manage your college content</p>
            </div>

            {loading ? (
              <Loader />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Subjects" value={stats.subjects} icon="📖" color="blue" />
                <StatCard title="Total Notes" value={stats.notes} icon="📚" color="green" />
                <StatCard title="Assignments" value={stats.assignments} icon="📝" color="purple" />
                <StatCard title="Announcements" value={stats.announcements} icon="📢" color="orange" />
              </div>
            )}

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card">
                <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <button className="w-full btn-secondary text-left">📚 Upload New Note</button>
                  <button className="w-full btn-secondary text-left">📝 Create Assignment</button>
                  <button className="w-full btn-secondary text-left">📢 Post Announcement</button>
                  <button className="w-full btn-secondary text-left">📖 Add Subject</button>
                </div>
              </div>

              <div className="card">
                <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
                <p className="text-gray-400 text-center py-8">No recent activity</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;