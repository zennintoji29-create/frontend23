
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import api from '../api/axios';
import { useAuth } from '../auth/AuthContext';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const { isAdmin } = useAuth();

  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    subject: '',
    fileUrl: '',
    fileType: 'pdf',
    semester: '',
    department: '',
    tags: '',
  });
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    fetchData();
  }, [selectedSubject]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedSubject) params.subject = selectedSubject;
      if (searchTerm) params.search = searchTerm;

      const [notesRes, subjectsRes] = await Promise.all([
        api.get('/notes', { params }),
        api.get('/admin/subjects'),
      ]);

      setNotes(notesRes.data.data.notes);
      setSubjects(subjectsRes.data.data.subjects);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setUploadError('');
    setUploadLoading(true);

    try {
      const payload = {
        ...uploadForm,
        semester: parseInt(uploadForm.semester),
        tags: uploadForm.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      };

      await api.post('/admin/notes', payload);
      setShowUploadForm(false);
      setUploadForm({
        title: '',
        description: '',
        subject: '',
        fileUrl: '',
        fileType: 'pdf',
        semester: '',
        department: '',
        tags: '',
      });
      fetchData();
    } catch (error) {
      setUploadError(error.response?.data?.message || 'Failed to upload note');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDelete = async (noteId) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      await api.delete(`/admin/notes/${noteId}`);
      fetchData();
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-white">Notes</h1>
              {isAdmin && (
                <button
                  onClick={() => setShowUploadForm(!showUploadForm)}
                  className="btn-primary"
                >
                  {showUploadForm ? 'Cancel' : '+ Upload Note'}
                </button>
              )}
            </div>

            {showUploadForm && isAdmin && (
              <div className="card mb-6 animate-slide-in">
                <h2 className="text-xl font-bold text-white mb-4">Upload New Note</h2>
                {uploadError && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    {uploadError}
                  </div>
                )}
                <form onSubmit={handleUploadSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Title *</label>
                      <input
                        type="text"
                        value={uploadForm.title}
                        onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label className="label">Subject *</label>
                      <select
                        value={uploadForm.subject}
                        onChange={(e) => setUploadForm({ ...uploadForm, subject: e.target.value })}
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
                    <label className="label">Description</label>
                    <textarea
                      value={uploadForm.description}
                      onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                      className="input-field"
                      rows="3"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="label">File URL *</label>
                      <input
                        type="url"
                        value={uploadForm.fileUrl}
                        onChange={(e) => setUploadForm({ ...uploadForm, fileUrl: e.target.value })}
                        className="input-field"
                        placeholder="https://example.com/file.pdf"
                        required
                      />
                    </div>
                    <div>
                      <label className="label">File Type</label>
                      <select
                        value={uploadForm.fileType}
                        onChange={(e) => setUploadForm({ ...uploadForm, fileType: e.target.value })}
                        className="input-field"
                      >
                        <option value="pdf">PDF</option>
                        <option value="doc">Document</option>
                        <option value="ppt">Presentation</option>
                        <option value="image">Image</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Semester *</label>
                      <select
                        value={uploadForm.semester}
                        onChange={(e) => setUploadForm({ ...uploadForm, semester: e.target.value })}
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
                        value={uploadForm.department}
                        onChange={(e) => setUploadForm({ ...uploadForm, department: e.target.value })}
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label className="label">Tags (comma separated)</label>
                      <input
                        type="text"
                        value={uploadForm.tags}
                        onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
                        className="input-field"
                        placeholder="chapter1, midterm, important"
                      />
                    </div>
                  </div>

                  <button type="submit" disabled={uploadLoading} className="btn-primary">
                    {uploadLoading ? 'Uploading...' : 'Upload Note'}
                  </button>
                </form>
              </div>
            )}

            <div className="card mb-6">
              <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search notes..."
                  className="input-field flex-1"
                />
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="input-field md:w-64"
                >
                  <option value="">All Subjects</option>
                  {subjects.map((subject) => (
                    <option key={subject._id} value={subject._id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
                <button type="submit" className="btn-primary">Search</button>
              </form>
            </div>

            {loading ? (
              <Loader />
            ) : notes.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-gray-400">No notes found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.map((note) => (
                  <div key={note._id} className="card-hover">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-white text-lg">{note.title}</h3>
                      <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-full border border-blue-500/30">
                        {note.fileType}
                      </span>
                    </div>

                    {note.description && (
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">{note.description}</p>
                    )}

                    <div className="space-y-2 mb-4">
                      <p className="text-gray-500 text-sm">
                        <span className="text-gray-400">Subject:</span> {note.subject?.name}
                      </p>
                      <p className="text-gray-500 text-sm">
                        <span className="text-gray-400">Semester:</span> {note.semester}
                      </p>
                      <p className="text-gray-500 text-sm">
                        <span className="text-gray-400">Department:</span> {note.department}
                      </p>
                    </div>

                    {note.tags && note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {note.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-dark-800 text-gray-400 text-xs rounded border border-gray-700"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2 pt-3 border-t border-gray-800">
                      <a
                        href={note.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary flex-1 text-center text-sm"
                      >
                        View Note
                      </a>
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(note._id)}
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

export default Notes;