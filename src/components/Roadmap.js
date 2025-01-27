import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../styles/Roadmap.css';
import { supabase } from '../supabase/config';
import useWindowDimensions from '../hooks/useWindowDimensions';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ProjectPDF from './ProjectPDF';

gsap.registerPlugin(ScrollTrigger);

const TEAM_GOALS = {
  THOUGHT_LEADER: {
    id: 'thought_leader',
    label: 'Thought Leader Initiative',
    icon: '🎯'
  },
  CLIENT_CONVERSATIONS: {
    id: 'client_conversations',
    label: 'Better Conversations with Clients',
    icon: '💬'
  },
  ENGAGEMENT_ROI: {
    id: 'engagement_roi',
    label: 'Maximise Return on Engagement Effort',
    icon: '📈'
  },
  OPPORTUNITIES: {
    id: 'opportunities',
    label: 'Identify Product/Engagement Opportunities',
    icon: '💡'
  },
  NEW_CLIENTS: {
    id: 'new_clients',
    label: 'Identify New Clients/Market Share',
    icon: '🤝'
  },
  DRIVE_FLOW: {
    id: 'drive_flow',
    label: 'Drive More Flow',
    icon: '⚡'
  },
  EFFICIENCY: {
    id: 'efficiency',
    label: 'Drive Efficiency/Data Quality',
    icon: '⚙️'
  }
};

const NOTE_TYPES = {
  BLOCKER: { icon: '🚫', label: 'Blocker' },
  DEPENDENCY: { icon: '🔄', label: 'Dependency' },
  WARNING: { icon: '⚠️', label: 'Warning' },
  INFO: { icon: 'ℹ️', label: 'Info' }
};

const STATUS_TYPES = {
  'Completed': { icon: '✅', label: 'Completed' },
  'In Progress': { icon: '🔄', label: 'In Progress' },
  'Not Started': { icon: '⛔', label: 'Not Started' }
};

const PROJECT_KPIS = {
  BETTER_CONVERSATIONS: {
    id: 'better_conversations',
    text: 'Enable better conversations with clients',
    icon: '💬'
  },
  COLLABORATE_INSIGHTS: {
    id: 'collaborate_insights',
    text: 'Collaborate across functions to deliver scalable data insights',
    icon: '📊'
  },
  KPI_SOLUTIONS: {
    id: 'kpi_solutions',
    text: 'Enable business with KPI Measurement Solutions',
    icon: '📈'
  }
};

const AddMilestoneModal = ({ isOpen, onClose, onAdd }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [completion, setCompletion] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({
      title,
      description,
      date,
      completion: Number(completion)
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Add New Milestone</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input
              type="text"
              placeholder="e.g., March 2024"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Completion (%)</label>
            <input
              type="number"
              value={completion}
              onChange={(e) => setCompletion(e.target.value)}
              min="0"
              max="100"
              required
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              Add Milestone
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AddProjectModal = ({ isOpen, onClose, onAdd }) => {
  const [projectData, setProjectData] = useState({
    name: '',
    summary: '',
    kpis: [],
    goals: []
  });

  const toggleKPI = (kpiId) => {
    setProjectData(prev => ({
      ...prev,
      kpis: prev.kpis.includes(kpiId)
        ? prev.kpis.filter(id => id !== kpiId)
        : [...prev.kpis, kpiId]
    }));
  };

  const toggleGoal = (goal) => {
    setProjectData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g.id !== goal.id)
        : [...prev.goals, goal]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(projectData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Add New Project</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Project Name</label>
            <input
              type="text"
              value={projectData.name}
              onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Project Summary</label>
            <textarea
              value={projectData.summary}
              onChange={(e) => setProjectData({ ...projectData, summary: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Team Goals</label>
            <div className="goals-select">
              {Object.values(TEAM_GOALS).map(goal => (
                <button
                  key={goal.id}
                  type="button"
                  className={`goal-select-btn ${projectData.goals.includes(goal) ? 'selected' : ''}`}
                  onClick={() => toggleGoal(goal)}
                >
                  <span className="goal-select-icon">{goal.icon}</span>
                  <span className="goal-select-text">{goal.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Project KPIs</label>
            <div className="kpi-selector">
              {Object.values(PROJECT_KPIS).map((kpi) => (
                <button
                  key={kpi.id}
                  type="button"
                  className={`kpi-select-btn ${projectData.kpis.includes(kpi.id) ? 'selected' : ''}`}
                  onClick={() => toggleKPI(kpi.id)}
                >
                  <span className="kpi-select-icon">{kpi.icon}</span>
                  <span className="kpi-select-text">{kpi.text}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              Add Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditSummaryModal = ({ isOpen, onClose, currentSummary, onSave }) => {
  const [summary, setSummary] = useState(currentSummary);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(summary);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Edit Project Summary</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Summary</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              required
              rows={4}
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const StatusUpdateModal = ({ isOpen, onClose, onSave, currentUpdates = [] }) => {
  const [newUpdate, setNewUpdate] = useState({
    content: '',
    status: 'Completed'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting status update:', newUpdate);
    console.log('Available status types:', Object.keys(STATUS_TYPES));
    onSave(newUpdate);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Add Status Update</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Status Message</label>
            <textarea
              value={newUpdate.content}
              onChange={(e) => setNewUpdate({ ...newUpdate, content: e.target.value })}
              placeholder="Enter status update..."
              required
            />
          </div>
          <div className="form-group status-selector">
            <label>Status</label>
            <div className="status-options">
              {Object.entries(STATUS_TYPES).map(([key, { icon, label }]) => (
                <button
                  key={key}
                  type="button"
                  className={`status-option ${newUpdate.status === key ? 'selected' : ''}`}
                  onClick={() => setNewUpdate({ ...newUpdate, status: key })}
                >
                  <span className="status-icon">{icon}</span>
                  <span className="status-label">{label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              Add Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditMilestoneModal = ({ isOpen, onClose, onSave, milestone }) => {
  const [title, setTitle] = useState(milestone.title);
  const [description, setDescription] = useState(milestone.description);
  const [date, setDate] = useState(milestone.date);
  const [completion, setCompletion] = useState(milestone.completion);
  const [notes, setNotes] = useState(milestone.notes || []);
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNote, setNewNote] = useState({ type: 'INFO', content: '' });

  const handleAddNote = () => {
    if (newNote.content.trim()) {
      setNotes([...notes, { ...newNote, id: Date.now() }]);
      setNewNote({ type: 'INFO', content: '' });
      setShowAddNote(false);
    }
  };

  const handleRemoveNote = (noteId) => {
    setNotes(notes.filter(note => note.id !== noteId));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...milestone,
      title,
      description,
      date,
      completion: Number(completion),
      notes
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Edit Milestone</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input
              type="text"
              placeholder="e.g., March 2024"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Completion (%)</label>
            <input
              type="number"
              value={completion}
              onChange={(e) => setCompletion(e.target.value)}
              min="0"
              max="100"
              required
            />
          </div>
          <div className="form-group">
            <div className="notes-header">
              <label>Notes</label>
              <button 
                type="button" 
                className="add-note-btn"
                onClick={() => setShowAddNote(true)}
              >
                + Add Note
              </button>
            </div>
            {showAddNote && (
              <div className="add-note-form">
                <select
                  value={newNote.type}
                  onChange={(e) => setNewNote({ ...newNote, type: e.target.value })}
                  className="note-type-select"
                >
                  {Object.entries(NOTE_TYPES).map(([key, { icon, label }]) => (
                    <option key={key} value={key}>
                      {icon} {label}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  placeholder="Enter note content..."
                  className="note-input"
                />
                <div className="note-actions">
                  <button type="button" className="cancel-note-btn" onClick={() => setShowAddNote(false)}>
                    Cancel
                  </button>
                  <button type="button" className="add-note-submit-btn" onClick={handleAddNote}>
                    Add
                  </button>
                </div>
              </div>
            )}
            <div className="notes-list">
              {notes.map(note => (
                <div key={note.id} className={`note-item note-${note.type.toLowerCase()}`}>
                  <span className="note-icon">
                    {NOTE_TYPES[note.type.toUpperCase()]?.icon || 'ℹ️'}
                  </span>
                  <span className="note-content">{note.content}</span>
                  <button
                    type="button"
                    className="remove-note-btn"
                    onClick={() => handleRemoveNote(note.id)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditStatusModal = ({ isOpen, onClose, onSave, status }) => {
  const [editedStatus, setEditedStatus] = useState({
    content: status.content || '',
    status: status.status_type || 'Not Started',
    date: status.date || new Date().toISOString(),
    id: status.id
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(editedStatus);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Edit Status Update</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Status Message</label>
            <textarea
              value={editedStatus.content}
              onChange={(e) => setEditedStatus({ ...editedStatus, content: e.target.value })}
              placeholder="Enter status update..."
              required
            />
          </div>
          <div className="form-group status-selector">
            <label>Status</label>
            <div className="status-options">
              {Object.entries(STATUS_TYPES).map(([key, { icon, label }]) => (
                <button
                  key={key}
                  type="button"
                  className={`status-option ${editedStatus.status === key ? 'selected' : ''}`}
                  onClick={() => setEditedStatus({ ...editedStatus, status: key })}
                >
                  <span className="status-icon">{icon}</span>
                  <span className="status-label">{label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const FadeInSection = ({ children }) => {
  const domRef = useRef();
  const [isVisible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      // In your case there's only one element to observe:     
      if (entries[0].isIntersecting) {
        setVisible(true);
        // No need to keep observing:
        observer.unobserve(domRef.current);
      }
    });
    
    observer.observe(domRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={domRef} 
      className={`fade-section ${isVisible ? 'is-visible' : ''}`}
    >
      {children}
    </div>
  );
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal confirmation-modal">
        <h2>{title}</h2>
        <p className="confirmation-message">{message}</p>
        <div className="modal-actions">
          <button type="button" onClick={onClose} className="cancel-btn">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className="delete-btn">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const EditProjectModal = ({ isOpen, onClose, project, onSave }) => {
  const [projectData, setProjectData] = useState({
    name: project.name,
    summary: project.summary,
    kpis: project.kpis || []
  });

  const toggleKPI = (kpiId) => {
    setProjectData(prev => ({
      ...prev,
      kpis: prev.kpis.includes(kpiId)
        ? prev.kpis.filter(id => id !== kpiId)
        : [...prev.kpis, kpiId]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(projectData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Edit Project</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Project Name</label>
            <input
              type="text"
              value={projectData.name}
              onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Project Summary</label>
            <textarea
              value={projectData.summary}
              onChange={(e) => setProjectData({ ...projectData, summary: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Project KPIs</label>
            <div className="kpi-selector">
              {Object.values(PROJECT_KPIS).map((kpi) => (
                <button
                  key={kpi.id}
                  type="button"
                  className={`kpi-select-btn ${projectData.kpis.includes(kpi.id) ? 'selected' : ''}`}
                  onClick={() => toggleKPI(kpi.id)}
                >
                  <span className="kpi-select-icon">{kpi.icon}</span>
                  <span className="kpi-select-text">{kpi.text}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Roadmap = () => {
  // Get the saved project index from localStorage, default to 0 if not found
  const savedProjectIndex = parseInt(localStorage.getItem('activeProjectIndex')) || 0;
  const [activeProject, setActiveProject] = useState(savedProjectIndex);
  const roadRef = useRef(null);
  const containerRef = useRef(null);
  const [userRole, setUserRole] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showEditMilestoneModal, setShowEditMilestoneModal] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [projects, setProjects] = useState([]);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const width = useWindowDimensions();
  const timelineRef = useRef(null);
  const [showEditStatusModal, setShowEditStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [showDeleteMilestoneModal, setShowDeleteMilestoneModal] = useState(false);
  const [showDeleteStatusModal, setShowDeleteStatusModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [activeNotesMilestone, setActiveNotesMilestone] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState(['completed']); // Default to showing completed
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedProjectForExport, setSelectedProjectForExport] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Add this to determine layout
  const isMobile = width <= 768;
  const isTablet = width <= 1200 && width > 768;

  // Scroll handler with debounce for smoother performance
  useEffect(() => {
    const timeline = timelineRef.current;
    if (!timeline) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollTop = timeline.scrollTop;
          setIsHeaderVisible(scrollTop < 50);  // Added small threshold for smoother transition
          ticking = false;
        });
        ticking = true;
      }
    };

    timeline.addEventListener('scroll', handleScroll);
    return () => timeline.removeEventListener('scroll', handleScroll);
  }, []);

  // Add this effect to get the current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
    };
    
    getCurrentUser();
  }, []);

  // Update the migrateOldNotes function to handle cases where user might not be loaded yet
  const migrateOldNotes = async (milestone) => {
    try {
      // Check if milestone has old notes format (as a JSON field)
      if (milestone.notes && !Array.isArray(milestone.notes)) {
        const oldNotes = Object.entries(milestone.notes).map(([type, content]) => ({
          type,
          content
        }));

        // Get current user if not already set
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        // Insert old notes into new table
        const { data, error } = await supabase
          .from('milestone_notes')
          .insert(
            oldNotes.map(note => ({
              milestone_id: milestone.id,
              type: note.type,
              content: note.content,
              created_by: currentUser?.id || null
            }))
          )
          .select();

        if (error) throw error;

        // Clear old notes from milestone
        const { error: updateError } = await supabase
          .from('milestones')
          .update({ notes: null })
          .eq('id', milestone.id);

        if (updateError) throw updateError;

        return data;
      }
      return milestone.milestone_notes || [];
    } catch (error) {
      console.error('Error migrating notes:', error);
      return milestone.milestone_notes || [];
    }
  };

  // Update the fetch projects effect to include status updates
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // First fetch projects with milestones and notes
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select(`
            *,
            milestones (
              *,
              milestone_notes (
                *
              )
            )
          `)
          .order('created_at');

        if (projectsError) throw projectsError;

        // Ensure the saved index is valid
        const validIndex = savedProjectIndex < projectsData.length ? savedProjectIndex : 0;
        if (validIndex !== activeProject) {
          setActiveProject(validIndex);
          localStorage.setItem('activeProjectIndex', validIndex);
        }

        // Then fetch status updates for the current project
        const { data: statusUpdates, error: statusError } = await supabase
          .from('status_updates')
          .select('*')
          .eq('project_id', projectsData[activeProject]?.id)
          .order('created_at', { ascending: false });

        if (statusError) throw statusError;

        // Process and combine the data
        const processedProjects = await Promise.all(
          projectsData.map(async (project) => ({
            ...project,
            status_updates: statusUpdates.filter(update => update.project_id === project.id),
            milestones: await Promise.all(
              (project.milestones || [])
                .sort((a, b) => a.position - b.position)
                .map(async (milestone) => ({
                  ...milestone,
                  notes: await migrateOldNotes(milestone)
                }))
            )
          }))
        );

        setProjects(processedProjects);
      } catch (error) {
        console.error('Error fetching projects:', error);
        alert('Failed to fetch projects');
      }
    };

    if (user) {
      fetchProjects();
    }
  }, [user, activeProject, savedProjectIndex]);

  useEffect(() => {
    const getUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user); // Debug log
      
      if (user) {
        const { data: profile, error } = await supabase.from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        console.log('User profile:', profile, 'Error:', error); // Debug log
        setUserRole(profile?.role);
      }
    };
    getUserRole();
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error.message);
    }
  };

  const handleAddNewMilestone = async (milestoneData) => {
    try {
      // Get the current number of milestones for position
      const position = projects[activeProject].milestones?.length || 0;
      
      // Log the project ID to verify it's a UUID
      console.log('Project ID:', projects[activeProject].id);
      
      // Create the new milestone
      const { data, error } = await supabase
        .from('milestones')
        .insert([
          {
            project_id: projects[activeProject].id,
            title: milestoneData.title,
            description: milestoneData.description,
            date: milestoneData.date,
            completion: milestoneData.completion,
            position: position
          }
        ])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      // Update local state
      const updatedProjects = [...projects];
      updatedProjects[activeProject] = {
        ...updatedProjects[activeProject],
        milestones: [
          ...(updatedProjects[activeProject].milestones || []),
          data[0]
        ]
      };
      setProjects(updatedProjects);
      setShowAddModal(false);

    } catch (error) {
      console.error('Error adding milestone:', error);
      alert('Failed to add milestone. Please try again.');
    }
  };

  const handleAddProject = async (projectData) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          name: projectData.name,
          summary: projectData.summary,
          kpis: projectData.kpis,
          goals: projectData.goals
        }])
        .select();

      if (error) throw error;

      setProjects([...projects, { ...data[0], milestones: [] }]);
      setShowProjectModal(false);
    } catch (error) {
      console.error('Error adding project:', error);
      alert('Failed to add project. Please try again.');
    }
  };

  const handleUpdateSummary = async (newSummary) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ summary: newSummary })
        .eq('id', projects[activeProject].id);

      if (error) throw error;

      // Update local state
      setProjects(prevProjects => {
        const updatedProjects = [...prevProjects];
        updatedProjects[activeProject] = {
          ...updatedProjects[activeProject],
          summary: newSummary
        };
        return updatedProjects;
      });

      setShowSummaryModal(false);
    } catch (error) {
      console.error('Error updating summary:', error);
      alert('Failed to update summary. Please try again.');
    }
  };

  const handleUpdateStatus = async (updates) => {
    try {
      // First get the current user
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      // Log the data we're about to send
      console.log('Attempting to create status update with:', {
        content: updates.content,
        status_type: updates.status,
        project_id: projects[activeProject].id,
        created_by: currentUser?.id
      });

      const { data, error } = await supabase
        .from('status_updates')
        .insert([{
          content: updates.content,
          status_type: updates.status,
          project_id: projects[activeProject].id,
          created_by: currentUser?.id
        }])
        .select();

      if (error) {
        console.error('Supabase error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      console.log('Successfully created status update:', data[0]);

      // Update local state
      setProjects(prevProjects => {
        const updatedProjects = [...prevProjects];
        updatedProjects[activeProject] = {
          ...updatedProjects[activeProject],
          status_updates: [
            data[0],
            ...(updatedProjects[activeProject].status_updates || [])
          ]
        };
        return updatedProjects;
      });

      setShowStatusModal(false);
    } catch (error) {
      console.error('Full error object:', error);
      console.error('Error updating status:', error.message);
      alert(`Failed to update status: ${error.message}`);
    }
  };

  const handleProjectChange = (index) => {
    setActiveProject(index);
    localStorage.setItem('activeProjectIndex', index);
    // Scroll timeline to top when changing projects
    if (timelineRef.current) {
      timelineRef.current.scrollTop = 0;
    }
  };

  const handleEditMilestone = async (updatedMilestone) => {
    try {
      const { error } = await supabase
        .from('milestones')
        .update({
          title: updatedMilestone.title,
          description: updatedMilestone.description,
          date: updatedMilestone.date,
          completion: updatedMilestone.completion
        })
        .eq('id', updatedMilestone.id);

      if (error) throw error;

      // Update local state
      setProjects(prevProjects => {
        const updatedProjects = [...prevProjects];
        updatedProjects[activeProject] = {
          ...updatedProjects[activeProject],
          milestones: updatedProjects[activeProject].milestones.map(m =>
            m.id === updatedMilestone.id ? updatedMilestone : m
          )
        };
        return updatedProjects;
      });

      setShowEditMilestoneModal(false);
      setSelectedMilestone(null);
    } catch (error) {
      console.error('Error updating milestone:', error);
      alert('Failed to update milestone. Please try again.');
    }
  };

  const handleEditStatus = async (updatedStatus) => {
    try {
      console.log('Attempting to update status with:', {
        content: updatedStatus.content,
        status_type: updatedStatus.status,
        id: updatedStatus.id
      });

      const { error } = await supabase
        .from('status_updates')
        .update({
          content: updatedStatus.content,
          status_type: updatedStatus.status
        })
        .eq('id', updatedStatus.id);

      if (error) {
        console.error('Supabase update error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      console.log('Successfully updated status');

      // Update local state
      setProjects(prevProjects => {
        const updatedProjects = [...prevProjects];
        const currentProject = updatedProjects[activeProject];
        currentProject.status_updates = currentProject.status_updates.map(update =>
          update.id === updatedStatus.id ? {
            ...update,
            content: updatedStatus.content,
            status_type: updatedStatus.status
          } : update
        );
        return updatedProjects;
      });

      setShowEditStatusModal(false);
      setSelectedStatus(null);
    } catch (error) {
      console.error('Full error object:', error);
      console.error('Error updating status:', error.message);
      alert(`Failed to update status: ${error.message}`);
    }
  };

  // Add delete handlers
  const handleDeleteMilestone = async (milestone) => {
    try {
      const { error } = await supabase
        .from('milestones')
        .delete()
        .eq('id', milestone.id);

      if (error) throw error;

      // Update local state
      setProjects(prevProjects => {
        const updatedProjects = [...prevProjects];
        updatedProjects[activeProject] = {
          ...updatedProjects[activeProject],
          milestones: updatedProjects[activeProject].milestones.filter(m => m.id !== milestone.id)
        };
        return updatedProjects;
      });

      setShowDeleteMilestoneModal(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Error deleting milestone:', error);
      alert('Failed to delete milestone. Please try again.');
    }
  };

  const handleDeleteStatus = async (status) => {
    try {
      const { error } = await supabase
        .from('status_updates')
        .delete()
        .eq('id', status.id);

      if (error) throw error;

      // Update local state
      setProjects(prevProjects => {
        const updatedProjects = [...prevProjects];
        updatedProjects[activeProject] = {
          ...updatedProjects[activeProject],
          status_updates: updatedProjects[activeProject].status_updates.filter(
            update => update.id !== status.id
          )
        };
        return updatedProjects;
      });

      setShowDeleteStatusModal(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Error deleting status:', error);
      alert('Failed to delete status update. Please try again.');
    }
  };

  // Update the handleAddNote function to handle cases where user might not be loaded yet
  const handleAddNote = async (milestoneId, noteData) => {
    try {
      // Get current user if not already set
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('milestone_notes')
        .insert([
          {
            milestone_id: milestoneId,
            type: noteData.type,
            content: noteData.content,
            created_by: currentUser?.id || null
          }
        ])
        .select();

      if (error) throw error;

      // Update local state
      const updatedProjects = [...projects];
      const milestone = updatedProjects[activeProject].milestones.find(
        m => m.id === milestoneId
      );
      
      if (milestone) {
        milestone.notes = [...(milestone.notes || []), data[0]];
        setProjects(updatedProjects);
      }

      setShowAddNoteModal(false);
    } catch (error) {
      console.error('Error adding note:', error);
      alert('Failed to add note');
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleDeleteNote = async (noteId, milestoneId) => {
    try {
      const { error } = await supabase
        .from('milestone_notes')
        .delete()
        .match({ id: noteId });

      if (error) throw error;

      // Update local state
      const updatedProjects = [...projects];
      const milestone = updatedProjects[activeProject].milestones.find(
        m => m.id === milestoneId
      );
      
      if (milestone) {
        milestone.notes = milestone.notes.filter(note => note.id !== noteId);
        setProjects(updatedProjects);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note');
    }
  };

  // Also add this log in the render
  console.log('Current userRole:', userRole); // Debug log

  // Add this handler for editing projects
  const handleEditProject = async (updatedProject) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          name: updatedProject.name,
          summary: updatedProject.summary,
          kpis: updatedProject.kpis
        })
        .eq('id', selectedProject.id);

      if (error) throw error;

      // Update local state
      setProjects(prevProjects => {
        const updatedProjects = [...prevProjects];
        updatedProjects[activeProject] = {
          ...updatedProjects[activeProject],
          name: updatedProject.name,
          summary: updatedProject.summary,
          kpis: updatedProject.kpis
        };
        return updatedProjects;
      });

      setShowEditProjectModal(false);
      setSelectedProject(null);
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Failed to update project. Please try again.');
    }
  };

  // Add this function to handle expanding/collapsing groups
  const toggleStatusGroup = (groupName) => {
    setExpandedGroups(prev => {
      if (prev.includes(groupName)) {
        return prev.filter(g => g !== groupName);
      } else {
        return [...prev, groupName];
      }
    });
  };

  // Add this handler function
  const handleProjectContextMenu = (e, project) => {
    e.preventDefault(); // Prevent default context menu
    setSelectedProjectForExport(project);
    setShowExportModal(true);
  };

  // Add this handler
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Add this effect to close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.project-selector')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`roadmap-container ${isMobile ? 'mobile' : ''} ${isTablet ? 'tablet' : ''}`} ref={containerRef}>
      {/* Left column - Goals and KPIs */}
      <div className="goals-column">
        {/* Team KPIs Section */}
        <div className="team-section team-kpis">
          <h2>Team KPIs</h2>
          <div className="kpis-grid">
            {projects[activeProject]?.kpis?.map((kpiId) => {
              const kpi = Object.values(PROJECT_KPIS).find(k => k.id === kpiId);
              if (!kpi) return null;
              
              return (
                <div key={kpi.id} className="kpi-tile">
                  <span className="kpi-icon">{kpi.icon}</span>
                  <span className="kpi-label">{kpi.text}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team Goals Section */}
        <div className="team-section project-goals">
          <h2>Team Goals</h2>
          <div className="goals-grid">
            {Object.values(TEAM_GOALS).map((goal, index) => (
              <div 
                key={goal.id} 
                className={`goal-tile ${projects[activeProject]?.goals.some(g => g.id === goal.id) ? 'achieved' : ''}`}
                style={{ '--tile-index': index }}
              >
                <span className="goal-icon">{goal.icon}</span>
                <span className="goal-label">{goal.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Middle column - Timeline */}
      <div className="timeline-column" ref={timelineRef}>
        <div className="app-header">
          <h1>GM Insights Roadmap</h1>
          <div className="project-controls">
            {userRole === 'editor' && (
              <>
                <button
                  className="edit-project-btn"
                  onClick={() => {
                    setSelectedProject(projects[activeProject]);
                    setShowEditProjectModal(true);
                  }}
                >
                  <span className="material-icons">edit</span>
                </button>
                <button
                  className="add-project-btn"
                  onClick={() => setShowProjectModal(true)}
                >
                  <span className="material-icons">add</span>
                </button>
              </>
            )}
            <button className="sign-out-button" onClick={handleSignOut} title="Sign Out">
              <span className="sign-out-icon">🚪</span>
            </button>
          </div>
        </div>
        <div className={`project-header ${isHeaderVisible ? 'visible' : 'hidden'}`}>
          <div className={`project-selector ${isDropdownOpen ? 'open' : ''}`}>
            <button 
              className="selected-project" 
              onClick={toggleDropdown}
              onContextMenu={(e) => {
                e.preventDefault();
                handleProjectContextMenu(e, projects[activeProject]);
              }}
              title="Right-click to export as PDF"
            >
              {projects[activeProject]?.name || 'Select Project'}
            </button>
            <div className="project-tiles">
              {projects.map((project, index) => (
                <button
                  key={project.id}
                  className={`project-tile ${index === activeProject ? 'active' : ''}`}
                  onClick={() => {
                    handleProjectChange(index);
                    setIsDropdownOpen(false);
                  }}
                  onContextMenu={(e) => handleProjectContextMenu(e, project)}
                  title="Right-click to export as PDF"
                >
                  {project.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* Project summary without KPIs */}
          {projects.length > 0 && (
            <div className="project-summary">
              <p>{projects[activeProject].summary}</p>
              {userRole === 'editor' && (
                <button
                  className="edit-summary-btn"
                  onClick={() => setShowSummaryModal(true)}
                  title="Edit Summary"
                >
                  ✏️
                </button>
              )}
            </div>
          )}
        </div>
        {projects.length > 0 && (
          <div className="road" ref={roadRef}>
            <div className="road-line"></div>
            {projects[activeProject].milestones.map((milestone, index) => (
              <FadeInSection key={milestone.id}>
                <div className={`milestone ${index % 2 === 0 ? 'milestone-left' : 'milestone-right'}`}>
                  <div className="milestone-point"></div>
                  <div className="milestone-content">
                    {userRole === 'editor' && (
                      <div className="edit-controls">
                        <button 
                          className="edit-btn" 
                          title="Edit"
                          onClick={() => {
                            setSelectedMilestone(milestone);
                            setShowEditMilestoneModal(true);
                          }}
                        >
                          ✏️
                        </button>
                        <button 
                          className="delete-btn" 
                          title="Delete"
                          onClick={() => {
                            setItemToDelete(milestone);
                            setShowDeleteMilestoneModal(true);
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                    <div className="milestone-header">
                      <h3>{milestone.title}</h3>
                      <span className="completion">{milestone.completion}%</span>
                    </div>
                    <div className="milestone-date">{milestone.date}</div>
                    <p>{milestone.description}</p>
                    {milestone.notes && milestone.notes.length > 0 && (
                      <>
                        <div className="notes-header">Notes</div>
                        <div className="milestone-notes">
                          {milestone.notes.map(note => (
                            <div key={note.id} className={`note-item note-${note.type.toLowerCase()}`}>
                              <span className="note-icon">
                                {NOTE_TYPES[note.type.toUpperCase()]?.icon || 'ℹ️'}
                              </span>
                              <span className="note-content">{note.content}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${milestone.completion}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </FadeInSection>
            ))}
            {userRole === 'editor' && (
              <button 
                className="add-milestone-btn"
                onClick={() => setShowAddModal(true)}
                title="Add Milestone"
              >
                + Add Milestone
              </button>
            )}
          </div>
        )}
      </div>

      {/* Right column - Status Updates */}
      <div className="status-column">
        <div className="section-header">
          <h2>Status Updates</h2>
          {userRole === 'editor' && (
            <button 
              className="add-status-btn"
              onClick={() => setShowStatusModal(true)}
            >
              + Add Update
            </button>
          )}
        </div>
        <div className="status-updates-list">
          {projects[activeProject]?.status_updates?.length > 0 ? (
            <div className="status-groups">
              {/* Completed Updates */}
              <div className={`status-group ${expandedGroups.includes('completed') ? 'expanded' : ''}`}>
                <button 
                  className="status-group-header completed"
                  onClick={() => toggleStatusGroup('completed')}
                >
                  <div className="status-group-info">
                    <span className="status-icon">✅</span>
                    <span className="status-label">Completed</span>
                    <span className="status-count">
                      {projects[activeProject].status_updates.filter(u => u.status_type === 'Completed').length}
                    </span>
                  </div>
                  <span className="expand-icon">▼</span>
                </button>
                <div className="status-group-content">
                  {projects[activeProject].status_updates
                    .filter(update => update.status_type === 'Completed')
                    .map(update => (
                      <div key={update.id} className="status-update-card">
                        <div className="update-content">
                          <p>{update.content}</p>
                          {userRole === 'editor' && (
                            <div className="edit-controls">
                              <button 
                                className="edit-btn"
                                onClick={() => {
                                  setSelectedStatus(update);
                                  setShowEditStatusModal(true);
                                }}
                                title="Edit Status"
                              >
                                ✏️
                              </button>
                              <button 
                                className="delete-btn"
                                onClick={() => {
                                  setItemToDelete(update);
                                  setShowDeleteStatusModal(true);
                                }}
                                title="Delete Status"
                              >
                                🗑️
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* In Progress Updates */}
              <div className={`status-group ${expandedGroups.includes('in-progress') ? 'expanded' : ''}`}>
                <button 
                  className="status-group-header in-progress"
                  onClick={() => toggleStatusGroup('in-progress')}
                >
                  <div className="status-group-info">
                    <span className="status-icon">🔄</span>
                    <span className="status-label">In Progress</span>
                    <span className="status-count">
                      {projects[activeProject].status_updates.filter(u => u.status_type === 'In Progress').length}
                    </span>
                  </div>
                  <span className="expand-icon">▼</span>
                </button>
                <div className="status-group-content">
                  {projects[activeProject].status_updates
                    .filter(update => update.status_type === 'In Progress')
                    .map(update => (
                      <div key={update.id} className="status-update-card">
                        <div className="update-content">
                          <p>{update.content}</p>
                          {userRole === 'editor' && (
                            <div className="edit-controls">
                              <button 
                                className="edit-btn"
                                onClick={() => {
                                  setSelectedStatus(update);
                                  setShowEditStatusModal(true);
                                }}
                                title="Edit Status"
                              >
                                ✏️
                              </button>
                              <button 
                                className="delete-btn"
                                onClick={() => {
                                  setItemToDelete(update);
                                  setShowDeleteStatusModal(true);
                                }}
                                title="Delete Status"
                              >
                                🗑️
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Not Started Updates */}
              <div className={`status-group ${expandedGroups.includes('not-started') ? 'expanded' : ''}`}>
                <button 
                  className="status-group-header not-started"
                  onClick={() => toggleStatusGroup('not-started')}
                >
                  <div className="status-group-info">
                    <span className="status-icon">⛔</span>
                    <span className="status-label">Not Started</span>
                    <span className="status-count">
                      {projects[activeProject].status_updates.filter(u => u.status_type === 'Not Started').length}
                    </span>
                  </div>
                  <span className="expand-icon">▼</span>
                </button>
                <div className="status-group-content">
                  {projects[activeProject].status_updates
                    .filter(update => update.status_type === 'Not Started')
                    .map(update => (
                      <div key={update.id} className="status-update-card">
                        <div className="update-content">
                          <p>{update.content}</p>
                          {userRole === 'editor' && (
                            <div className="edit-controls">
                              <button 
                                className="edit-btn"
                                onClick={() => {
                                  setSelectedStatus(update);
                                  setShowEditStatusModal(true);
                                }}
                                title="Edit Status"
                              >
                                ✏️
                              </button>
                              <button 
                                className="delete-btn"
                                onClick={() => {
                                  setItemToDelete(update);
                                  setShowDeleteStatusModal(true);
                                }}
                                title="Delete Status"
                              >
                                🗑️
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="no-updates">
              <p>No status updates yet</p>
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <AddMilestoneModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddNewMilestone}
        />
      )}
      {showProjectModal && (
        <AddProjectModal
          isOpen={showProjectModal}
          onClose={() => setShowProjectModal(false)}
          onAdd={handleAddProject}
        />
      )}
      {showSummaryModal && (
        <EditSummaryModal
          isOpen={showSummaryModal}
          onClose={() => setShowSummaryModal(false)}
          currentSummary={projects[activeProject].summary}
          onSave={handleUpdateSummary}
        />
      )}
      {showStatusModal && (
        <StatusUpdateModal
          isOpen={showStatusModal}
          onClose={() => setShowStatusModal(false)}
          currentUpdates={Array.isArray(projects[activeProject]?.status_updates) 
            ? projects[activeProject].status_updates 
            : []}
          onSave={handleUpdateStatus}
        />
      )}
      {showEditMilestoneModal && selectedMilestone && (
        <EditMilestoneModal
          isOpen={showEditMilestoneModal}
          onClose={() => {
            setShowEditMilestoneModal(false);
            setSelectedMilestone(null);
          }}
          onSave={handleEditMilestone}
          milestone={selectedMilestone}
        />
      )}
      {showEditStatusModal && selectedStatus && (
        <EditStatusModal
          isOpen={showEditStatusModal}
          onClose={() => {
            setShowEditStatusModal(false);
            setSelectedStatus(null);
          }}
          onSave={handleEditStatus}
          status={selectedStatus}
        />
      )}
      
      {/* Add confirmation modals */}
      <ConfirmationModal
        isOpen={showDeleteMilestoneModal}
        onClose={() => {
          setShowDeleteMilestoneModal(false);
          setItemToDelete(null);
        }}
        onConfirm={() => handleDeleteMilestone(itemToDelete)}
        title="Delete Milestone"
        message="Are you sure you want to delete this milestone? This action cannot be undone."
      />

      <ConfirmationModal
        isOpen={showDeleteStatusModal}
        onClose={() => {
          setShowDeleteStatusModal(false);
          setItemToDelete(null);
        }}
        onConfirm={() => handleDeleteStatus(itemToDelete)}
        title="Delete Status Update"
        message="Are you sure you want to delete this status update? This action cannot be undone."
      />

      {/* Add Note Modal */}
      <AddNoteModal
        isOpen={showAddNoteModal}
        onClose={() => {
          setShowAddNoteModal(false);
          setActiveNotesMilestone(null);
        }}
        onAdd={handleAddNote}
        milestoneId={activeNotesMilestone}
      />

      {/* Add this with the other modals */}
      {showEditProjectModal && selectedProject && (
        <EditProjectModal
          isOpen={showEditProjectModal}
          onClose={() => {
            setShowEditProjectModal(false);
            setSelectedProject(null);
          }}
          project={selectedProject}
          onSave={handleEditProject}
        />
      )}

      {/* Add this modal component near your other modals */}
      {showExportModal && selectedProjectForExport && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Export Project</h2>
            <p>Do you want to export "{selectedProjectForExport.name}" as PDF?</p>
            <div className="modal-actions">
              <button 
                className="cancel-btn" 
                onClick={() => {
                  setShowExportModal(false);
                  setSelectedProjectForExport(null);
                }}
              >
                Cancel
              </button>
              <PDFDownloadLink
                document={
                  <ProjectPDF 
                    project={selectedProjectForExport}
                    statusUpdates={selectedProjectForExport.status_updates}
                    milestones={selectedProjectForExport.milestones}
                  />
                }
                fileName={`${selectedProjectForExport.name}-roadmap.pdf`}
              >
                {({ loading }) => (
                  <button className="submit-btn">
                    {loading ? 'Preparing PDF...' : 'Download PDF'}
                  </button>
                )}
              </PDFDownloadLink>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AddNoteModal = ({ isOpen, onClose, onAdd, milestoneId }) => {
  const [type, setType] = useState('info');
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(milestoneId, { type, content });
    setType('info');
    setContent('');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Add Note</h2>
        <form onSubmit={handleSubmit}>
          <select 
            value={type} 
            onChange={(e) => setType(e.target.value)}
            className="note-type-select"
          >
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="blocker">Blocker</option>
            <option value="dependency">Dependency</option>
          </select>
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Note content"
            className="note-input"
            required
          />
          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit">Add Note</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Roadmap; 