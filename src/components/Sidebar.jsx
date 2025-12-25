
import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const Sidebar = () => {
  const { isAdmin } = useAuth();

  const studentLinks = [
    { name: 'Dashboard', path: '/student', icon: '📊' },
    { name: 'Notes', path: '/student/notes', icon: '📚' },
    { name: 'Assignments', path: '/student/assignments', icon: '📝' },
    { name: 'Announcements', path: '/student/announcements', icon: '📢' },
  ];

  const adminLinks = [
    { name: 'Dashboard', path: '/admin', icon: '📊' },
    { name: 'Notes', path: '/admin/notes', icon: '📚' },
    { name: 'Assignments', path: '/admin/assignments', icon: '📝' },
    { name: 'Announcements', path: '/admin/announcements', icon: '📢' },
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  return (
    <aside className="w-64 bg-dark-900/50 backdrop-blur-sm border-r border-gray-800 min-h-[calc(100vh-4rem)] p-4">
      <nav className="space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.path.endsWith('/student') || link.path.endsWith('/admin')}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-gray-400 hover:bg-dark-800 hover:text-gray-200'
              }`
            }
          >
            <span className="text-xl">{link.icon}</span>
            <span className="font-medium">{link.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;