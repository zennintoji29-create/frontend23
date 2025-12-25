
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import api from '../api/axios';
import { useAuth } from '../auth/AuthContext';

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState('');
  const { isAdmin } = useAuth();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    subject: '',
    dueDate: '',
    maxMarks: '100',
    semester: '',
    department: '',
    attachmentUrl: '',
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    fetchData();
  }, [selectedSubject]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedSubject) params.subject = selectedSubject;

      const [assignmentsRes, subjectsRes] = await Promise.all([
        api.get('/assignments', { params }),
        api.get('/admin/subjects'),
      ]);

      setAssignments(assignmentsRes.data.data.assignments);
      setSubjects(subjectsRes.data.data.subjects);
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
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
        maxMarks: parseInt(createForm.maxMarks),
        semester: parseInt(createForm.semester),
      };

      await api.post('/admin/assignments', payload);
      setShowCreateForm(false);
      setCreateForm({
        title: '',
        description: '',
        subject: '',
        dueDate: '',
        maxMarks: '100',
        semester: '',
        department: '',
        attachmentUrl: '',
      });
      fetchData();
    } catch (error) {
      setCreateError(error.response?.data?.message || 'Failed to create assignment');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDelete = async (assignmentId) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;

    try {
      await api.delete(`/admin/assignments/${assignmentId}`);
      fetchData();
    } catch (error) {
      console.error('Failed to delete assignment:', error);
    }
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
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
              <h1 className="text-3xl font-bold text-white">Assignments</h1>
              {isAdmin && (
                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="btn-primary"
                >
                  {showCreateForm ? 'Cancel' : '+ Create Assignment'}
                </button>
              )}
            </div>

            {showCreateForm && isAdmin && (
              <div className="card mb-6 animate-slide-in">
                <h2 className="text-xl font-bold text-white mb-4">Create New Assignment</h2>
                {createError && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    {createError}
                  </div>
                )}
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <label className="label">Subject *</label>
                      <select
                        value={createForm.subject}
                        onChange={(e) => setCreateForm({ ...createForm, subject: e.target.value })}
                        className="input-field"
                        required
                      >
                        <option value="">Select Subject</option>
                        {subjects.map((subject) => (
                          <option key={subject._id} value={subject._id}>
                            {subject.name} ({subject.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="label">Description *</label>
                    <textarea
                      value={createForm.description}
                      onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                      className="input-field"
                      rows="4"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="label">Due Date *</label>
                      <input
                        type="datetime-local"
                        value={createForm.dueDate}
                        onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })}
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label className="label">Max Marks</label>
                      <input
                        type="number"
                        value={createForm.maxMarks}
                        onChange={(e) => setCreateForm({ ...createForm, maxMarks: e.target.value })}
                        className="input-field"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="label">Semester *</label>
                      <select
                        value={createForm.semester}
                        onChange={(e) => setCreateForm({ ...createForm, semester: e.target.value })}
                        className="input-field"
                        required
                      >
                        <option value="">Select</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                          <option key={sem} value={sem}>Semester {sem}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Department *</label>
                      <input
                        type="text"
                        value={createForm.department}
                        onChange={(e) => setCreateForm({ ...createForm, department: e.target.value })}
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label className="label">Attachment URL (optional)</label>
                      <input
                        type="url"
                        value={createForm.attachmentUrl}
                        onChange={(e) => setCreateForm({ ...createForm, attachmentUrl: e.target.value })}
                        className="input-field"
                        placeholder="https://example.com/file.pdf"
                      />
                    </div>
                  </div>

                  <button type="submit" disabled={createLoading} className="btn-primary">
                    {createLoading ? 'Creating...' : 'Create Assignment'}
                  </button>
                </form>
              </div>
            )}

            <div className="card mb-6">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="input-field"
              >
                <option value="">All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject._id} value={subject._id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            {loading ? (
              <Loader />
            ) : assignments.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-gray-400">No assignments found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {assignments.map((assignment) => (
                  <div key={assignment._id} className="card-hover">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-white text-lg">{assignment.title}</h3>
                      <span
                        className={`px-2 py-1 text-xs rounded-full border ${
                          isOverdue(assignment.dueDate)
                            ? 'bg-red-500/10 text-red-400 border-red-500/30'
                            : 'bg-green-500/10 text-green-400 border-green-500/30'
                        }`}
                      >
                        {assignment.status}
                      </span>
                    </div>

                    <p className="text-gray-400 text-sm mb-4">{assignment.description}</p>

                    <div className="space-y-2 mb-4">
                      <p className="text-gray-500 text-sm">
                        <span className="text-gray-400">Subject:</span> {assignment.subject?.name}
                      </p>
                      <p className="text-gray-500 text-sm">
                        <span className="text-gray-400">Due Date:</span>{' '}
                        <span className={isOverdue(assignment.dueDate) ? 'text-red-400' : ''}>
                          {formatDate(assignment.dueDate)}
                        </span>
                      </p>
                      <p className="text-gray-500 text-sm">
                        <span className="text-gray-400">Max Marks:</span> {assignment.maxMarks}
                      </p>
                      <p className="text-gray-500 text-sm">
                        <span className="text-gray-400">Semester:</span> {assignment.semester}
                      </p>
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-gray-800">
                      {assignment.attachmentUrl && (
                        <a
                          href={assignment.attachmentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary flex-1 text-center text-sm"
                        >
                          View Attachment
                        </a>
                      )}
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(assignment._id)}
                          className="px-3 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 rounded-lg border border-red-500/30 transition-all duration-200 text-sm"
                        >
                          Delete
                        </button>
                      )}
                    </div>
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

export default Assignments;