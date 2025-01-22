import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../styles/Roadmap.css';
import { supabase } from '../supabase/config';
import useWindowDimensions from '../hooks/useWindowDimensions';

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
  const [name, setName] = useState('');
  const [summary, setSummary] = useState('');
  const [selectedGoals, setSelectedGoals] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newProject = {
      name,
      summary,
      goals: selectedGoals,
      milestones: []
    };
    onAdd(newProject);
    
    // Reset form
    setName('');
    setSummary('');
    setSelectedGoals([]);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Add New Project</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Project Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Summary</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Goals</label>
            <div className="goals-select">
              {Object.values(TEAM_GOALS).map(goal => (
                <label key={goal.id} className="goal-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedGoals.includes(goal)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedGoals([...selectedGoals, goal]);
                      } else {
                        setSelectedGoals(selectedGoals.filter(g => g.id !== goal.id));
                      }
                    }}
                  />
                  {goal.icon} {goal.label}
                </label>
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
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    status: 'not_started'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const update = {
      ...newUpdate,
      id: Date.now()
    };
    onSave([...(currentUpdates || []), update]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Add Status Update</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={newUpdate.title}
              onChange={(e) => setNewUpdate({ ...newUpdate, title: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={newUpdate.description}
              onChange={(e) => setNewUpdate({ ...newUpdate, description: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select
              value={newUpdate.status}
              onChange={(e) => setNewUpdate({ ...newUpdate, status: e.target.value })}
            >
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={newUpdate.date}
              onChange={(e) => setNewUpdate({ ...newUpdate, date: e.target.value })}
              required
            />
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
                  <span className="note-icon">{NOTE_TYPES[note.type].icon}</span>
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
  const [title, setTitle] = useState(status.title);
  const [description, setDescription] = useState(status.description);
  const [date, setDate] = useState(status.date);
  const [statusState, setStatusState] = useState(status.status);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...status,
      title,
      description,
      date,
      status: statusState
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Edit Status Update</h2>
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
            <label>Status</label>
            <select
              value={statusState}
              onChange={(e) => setStatusState(e.target.value)}
            >
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
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

const Roadmap = () => {
  const [activeProject, setActiveProject] = useState(0);
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

  // Remove the duplicate scroll handler effect
  useEffect(() => {
    const fetchProjects = async () => {
      try {
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

        // Sort milestones by position
        const projectsWithSortedMilestones = projectsData.map(project => ({
          ...project,
          milestones: (project.milestones || [])
            .sort((a, b) => a.position - b.position)
            .map(milestone => ({
              ...milestone,
              notes: milestone.milestone_notes || []
            }))
        }));

        setProjects(projectsWithSortedMilestones);
      } catch (error) {
        console.error('Error fetching projects:', error);
        alert('Failed to fetch projects');
      }
    };

    fetchProjects();
  }, []);

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

  const handleAddProject = async (newProject) => {
    try {
      // First verify the user's role
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user);

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      console.log('User profile:', profile);

      if (profileError) {
        throw new Error('Could not verify user role');
      }

      if (profile?.role !== 'editor') {
        throw new Error('User does not have editor permissions');
      }

      // Proceed with project creation
      const projectData = {
        name: newProject.name,
        summary: newProject.summary,
        goals: newProject.goals,
        created_at: new Date().toISOString()
      };

      console.log('Sending project data:', projectData);

      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert([projectData])
        .select()
        .single();

      if (projectError) {
        console.error('Project creation error:', projectError);
        throw new Error(projectError.message);
      }

      console.log('Project created:', project);

      const projectWithMilestones = {
        ...project,
        milestones: []
      };

      setProjects(prevProjects => {
        const newProjects = [...prevProjects, projectWithMilestones];
        requestAnimationFrame(() => {
          setActiveProject(newProjects.length - 1);
        });
        return newProjects;
      });

      setShowProjectModal(false);

    } catch (error) {
      console.error('Detailed error:', error);
      alert(`Failed to create project: ${error.message}`);
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
      const { error } = await supabase
        .from('projects')
        .update({ status_updates: updates })
        .eq('id', projects[activeProject].id);

      if (error) throw error;

      setProjects(prevProjects => {
        const updatedProjects = [...prevProjects];
        updatedProjects[activeProject] = {
          ...updatedProjects[activeProject],
          status_updates: updates
        };
        return updatedProjects;
      });

      setShowStatusModal(false);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const handleProjectChange = (index) => {
    setActiveProject(index);
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
      const currentUpdates = projects[activeProject].status_updates || [];
      const updatedUpdates = currentUpdates.map(update =>
        update.id === updatedStatus.id ? updatedStatus : update
      );

      const { error } = await supabase
        .from('projects')
        .update({ status_updates: updatedUpdates })
        .eq('id', projects[activeProject].id);

      if (error) throw error;

      setProjects(prevProjects => {
        const updatedProjects = [...prevProjects];
        updatedProjects[activeProject] = {
          ...updatedProjects[activeProject],
          status_updates: updatedUpdates
        };
        return updatedProjects;
      });

      setShowEditStatusModal(false);
      setSelectedStatus(null);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
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
      const currentUpdates = projects[activeProject].status_updates || [];
      const updatedUpdates = currentUpdates.filter(update => update.id !== status.id);

      const { error } = await supabase
        .from('projects')
        .update({ status_updates: updatedUpdates })
        .eq('id', projects[activeProject].id);

      if (error) throw error;

      setProjects(prevProjects => {
        const updatedProjects = [...prevProjects];
        updatedProjects[activeProject] = {
          ...updatedProjects[activeProject],
          status_updates: updatedUpdates
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

  const handleAddNote = async (milestoneId, noteData) => {
    try {
      const { data, error } = await supabase
        .from('milestone_notes')
        .insert([
          {
            milestone_id: milestoneId,
            type: noteData.type,
            content: noteData.content,
            created_by: user.id
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

  return (
    <div className={`roadmap-container ${isMobile ? 'mobile' : ''} ${isTablet ? 'tablet' : ''}`} ref={containerRef}>
      {/* Left column - Goals */}
      <div className="goals-column">
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

      {/* Middle column - Timeline */}
      <div className="timeline-column" ref={timelineRef}>
        <div className="app-header">
          <h1>GM Insights Roadmap</h1>
          <div className="header-controls">
            <button onClick={handleSignOut} className="sign-out-button" title="Sign Out">
              <span className="sign-out-icon">🚪</span>
            </button>
          </div>
        </div>
        <div className={`project-header ${isHeaderVisible ? 'visible' : 'hidden'}`}>
          <div className="project-selector">
            <select 
              value={activeProject}
              onChange={(e) => handleProjectChange(Number(e.target.value))}
              className="project-dropdown"
            >
              {projects.map((project, index) => (
                <option key={project.id} value={index}>
                  {project.name}
                </option>
              ))}
            </select>
            {userRole === 'editor' && (
              <button 
                className="add-project-btn"
                onClick={() => setShowProjectModal(true)}
                title="Add New Project"
              >
                + New Project
              </button>
            )}
          </div>
          {projects.length > 0 && (
            <div className="project-summary">
              {projects[activeProject].summary}
              {userRole === 'editor' && (
                <button 
                  className="edit-summary-btn"
                  onClick={() => setShowSummaryModal(true)}
                  title="Edit Summary"
                >
                  <span>✏️</span>
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
                      <div className="milestone-notes">
                        {milestone.notes.map(note => (
                          <div key={note.id} className={`note-item note-${note.type.toLowerCase()}`}>
                            <span className="note-icon">{NOTE_TYPES[note.type].icon}</span>
                            <span className="note-content">{note.content}</span>
                          </div>
                        ))}
                      </div>
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
            projects[activeProject].status_updates.map(update => (
              <div key={update.id} className="status-update-card">
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
                <div className={`status-tag ${update.status}`}>
                  {update.status.replace('_', ' ')}
                </div>
                <div className="update-content">
                  <h3>{update.title}</h3>
                  <p>{update.description}</p>
                  <time>{update.date}</time>
                </div>
              </div>
            ))
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
          currentUpdates={projects[activeProject].status_updates || []}
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