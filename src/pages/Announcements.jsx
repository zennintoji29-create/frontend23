
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import api from '../api/axios';
import { useAuth } from '../auth/AuthContext';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterPriority, setFilterPriority] = useState('');
  const { isAdmin } = useAuth();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    content: '',
    priority: 'medium',
    targetAudience: {
      department: '',
      semester: '',
      all: true,
    },
    expiresAt: '',
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    fetchAnnouncements();
  }, [filterPriority]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterPriority) params.priority = filterPriority;

      const response = await api.get('/announcements', { params });
      setAnnouncements(response.data.data.announcements);
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateLoading(true);

    try {
      const payload = {
        ...createForm,
        targetAudience: {
          ...createForm.targetAudience,
          semester: createForm.targetAudience.semester
            ? parseInt(createForm.targetAudience.semester)
            : undefined,
        },
      };

      if (!payload.targetAudience.semester) {
        delete payload.targetAudience.semester;
      }

      await api.post('/admin/announcement', payload);

      setShowCreateForm(false);
      setCreateForm({
        title: '',
        content: '',
        priority: 'medium',
        targetAudience: {
          department: '',
          semester: '',
          all: true,
        },
        expiresAt: '',
      });
      fetchAnnouncements();
    } catch (error) {
      setCreateError(error.response?.data?.message || 'Failed to create announcement');
    } finally {
      setCreateLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: 'bg-red-500/10 text-red-400 border-red-500/30',
      high: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
      medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
      low: 'bg-green-500/10 text-green-400 border-green-500/30',
    };
    return colors[priority] || colors.medium;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-white">Announcements</h1>
              {isAdmin && (
                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="btn-primary"
                >
                  {showCreateForm ? 'Cancel' : '+ Create Announcement'}
                </button>
              )}
            </div>

            {showCreateForm && isAdmin && (
              <div className="card mb-6 animate-slide-in">
                <h2 className="text-xl font-bold text-white mb-4">Create New Announcement</h2>
                {createError && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    {createError}
                  </div>
                )}
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                  <div>
                    <label className="label">Title *</label>
                    <input
                      type="text"
                      value={createForm.title}
                      onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="label">Content *</label>
                    <textarea
                      value={createForm.content}
                      onChange={(e) => setCreateForm({ ...createForm, content: e.target.value })}
                      className="input-field"
                      rows="5"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Priority</label>
                      <select
                        value={createForm.priority}
                        onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value })}
                        className="input-field"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Expires At (optional)</label>
                      <input
                        type="datetime-local"
                        value={createForm.expiresAt}
                        onChange={(e) => setCreateForm({ ...createForm, expiresAt: e.target.value })}
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div className="border border-gray-700 rounded-lg p-4">
                    <h3 className="text-white font-medium mb-3">Target Audience</h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-gray-300">
                        <input
                          type="checkbox"
                          checked={createForm.targetAudience.all}
                          onChange={(e) =>
                            setCreateForm({
                              ...createForm,
                              targetAudience: {
                                ...createForm.targetAudience,
                                all: e.target.checked,
                              },
                            })
                          }
                          className="w-4 h-4"
                        />
                        All Students
                      </label>

                      {!createForm.targetAudience.all && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="label">Department</label>
                            <input
                              type="text"
                              value={createForm.targetAudience.department}
                              onChange={(e) =>
                                setCreateForm({
                                  ...createForm,
                                  targetAudience: {
                                    ...createForm.targetAudience,
                                    department: e.target.value,
                                  },
                                })
                              }
                              className="input-field"
                            />
                          </div>
                          <div>
                            <label className="label">Semester</label>
                            <select
                              value={createForm.targetAudience.semester}
                              onChange={(e) =>
                                setCreateForm({
                                  ...createForm,
                                  targetAudience: {
                                    ...createForm.targetAudience,
                                    semester: e.target.value,
                                  },
                                })
                              }
                              className="input-field"
                            >
                              <option value="">All Semesters</option>
                              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                                <option key={sem} value={sem}>Semester {sem}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <button type="submit" disabled={createLoading} className="btn-primary">
                    {createLoading ? 'Creating...' : 'Create Announcement'}
                  </button>
                </form>
              </div>
            )}

            <div className="card mb-6">
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="input-field"
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {loading ? (
              <Loader />
            ) : announcements.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-gray-400">No announcements found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div key={announcement._id} className="card-hover">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-white text-lg">{announcement.title}</h3>
                      <span className={`px-3 py-1 text-xs rounded-full border ${getPriorityColor(announcement.priority)}`}>
                        {announcement.priority}
                      </span>
                    </div>

                    <p className="text-gray-300 mb-4 whitespace-pre-wrap">{announcement.content}</p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <span>Posted by {announcement.createdBy?.name}</span>
                      <span>•</span>
                      <span>{formatDate(announcement.createdAt)}</span>
                      {announcement.expiresAt && (
                        <>
                          <span>•</span>
                          <span>Expires: {formatDate(announcement.expiresAt)}</span>
                        </>
                      )}
                    </div>

                    {!announcement.targetAudience?.all && (
                      <div className="mt-3 flex gap-2">
                        {announcement.targetAudience?.department && (
                          <span className="px-2 py-1 bg-dark-800 text-gray-400 text-xs rounded border border-gray-700">
                            {announcement.targetAudience.department}
                          </span>
                        )}
                        {announcement.targetAudience?.semester && (
                          <span className="px-2 py-1 bg-dark-800 text-gray-400 text-xs rounded border border-gray-700">
                            Semester {announcement.targetAudience.semester}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Announcements;
