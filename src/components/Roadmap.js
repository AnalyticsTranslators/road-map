import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../styles/Roadmap.css';
import { supabase } from '../supabase/config';

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

const AddMilestoneModal = ({ isOpen, onClose, onAdd }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [completion, setCompletion] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({
      id: Date.now(),
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

const Roadmap = () => {
  const [activeProject, setActiveProject] = useState(0);
  const roadRef = useRef(null);
  const containerRef = useRef(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select(`
            *,
            milestones (*)
          `)
          .order('id');
        
        if (error) {
          console.error('Error fetching projects:', error);
          return;
        }
        
        if (data) {
          setProjects(data);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    const road = roadRef.current;
    const container = containerRef.current;

    // Only proceed if road and container exist and we have projects
    if (!road || !container || !projects.length) return;

    const milestones = road.querySelectorAll('.milestone');
    const car = road.querySelector('.car');

    // Reset any existing animations
    gsap.killTweensOf(car);
    gsap.killTweensOf(milestones);

    // Only proceed if there are milestones
    if (milestones.length > 0 && car) {
      // Calculate first milestone position
      const firstMilestoneTop = milestones[0].offsetTop;

      // Set initial car position to first milestone
      gsap.set(car, { 
        opacity: 1,
        top: firstMilestoneTop
      });

      // Create timeline for car movement
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: "bottom bottom",
          scrub: 1
        }
      });

      // Animate car along the path
      tl.to(car, {
        top: "100%",
        duration: 1,
        ease: "none"
      });

      // Animate milestones
      milestones.forEach((milestone, index) => {
        gsap.to(milestone, {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: milestone,
            start: "top center+=100",
            toggleActions: "play none none reverse"
          }
        });
      });
    } else if (car) {
      // If no milestones but car exists, just position it at the top
      gsap.set(car, { 
        opacity: 1,
        top: '10%'
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [activeProject, projects]);

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

  const handleAddMilestone = () => {
    setShowAddModal(true);
  };

  const handleAddNewMilestone = (newMilestone) => {
    // Here you would typically make an API call to save to Supabase
    console.log('New milestone:', newMilestone);
    // For now, just update local state
    const updatedProjects = [...projects];
    updatedProjects[activeProject].milestones.push(newMilestone);
    // TODO: Update projects in database
    setShowAddModal(false);
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

  // Also add this log in the render
  console.log('Current userRole:', userRole); // Debug log

  return (
    <div className="roadmap-container" ref={containerRef}>
      <div className="app-header">
        <h1>GM Insights Roadmap</h1>
        <div className="header-controls">
          <button onClick={handleSignOut} className="sign-out-button" title="Sign Out">
            <span className="sign-out-icon">🚪</span>
          </button>
        </div>
      </div>
      <div className="project-header">
        <div className="project-tabs">
          {projects.map((project, index) => (
            <button
              key={project.id}
              className={`tab ${activeProject === index ? 'active' : ''}`}
              onClick={() => setActiveProject(index)}
            >
              {project.name}
            </button>
          ))}
          {userRole === 'editor' && (
            <button 
              className="tab add-project-tab"
              onClick={() => setShowProjectModal(true)}
              title="Add New Project"
            >
              <span>+</span> New Project
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
      {projects.length > 0 ? (
        <>
          <div className="project-goals">
            <h2>Team Goals</h2>
            <div className="goals-grid">
              {Object.values(TEAM_GOALS).map((goal, index) => (
                <div 
                  key={goal.id} 
                  className={`goal-tile ${projects[activeProject].goals.some(g => g.id === goal.id) ? 'achieved' : ''}`}
                  style={{ '--tile-index': index }}
                >
                  <span className="goal-icon">{goal.icon}</span>
                  <span className="goal-label">{goal.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="road" ref={roadRef}>
            <div className="road-line"></div>
            {projects[activeProject].milestones.length > 0 && (
              <div className="car">
                <div className="car-icon">🚗</div>
              </div>
            )}
            {projects[activeProject].milestones.map((milestone, index) => (
              <div 
                key={milestone.id}
                className={`milestone ${isEditMode ? 'editable' : ''}`}
                style={{ 
                  top: `${(index * 100) / (projects[activeProject].milestones.length - 1)}%`,
                  opacity: 1
                }}
              >
                <div className="milestone-point"></div>
                <div className="milestone-content">
                  {isEditMode && (
                    <div className="edit-controls">
                      <button className="edit-btn" title="Edit">✏️</button>
                      <button className="delete-btn" title="Delete">🗑️</button>
                      <button className="move-btn" title="Drag to reorder">↕️</button>
                    </div>
                  )}
                  <div className="milestone-header">
                    <h3>{milestone.title}</h3>
                    <span className="completion">{milestone.completion}%</span>
                  </div>
                  <div className="milestone-date">{milestone.date}</div>
                  <p>{milestone.description}</p>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${milestone.completion}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {userRole === 'editor' && (
            <div className="edit-controls-container">
              <button 
                className={`edit-mode-toggle ${isEditMode ? 'active' : ''}`}
                onClick={() => setIsEditMode(!isEditMode)}
                title={isEditMode ? "Exit Edit Mode" : "Enter Edit Mode"}
              >
                <span className="edit-icon">✏️</span>
              </button>
            </div>
          )}
          {isEditMode && (
            <button 
              className="add-milestone-circle" 
              onClick={handleAddMilestone}
              title="Add Milestone"
            >
              +
            </button>
          )}
        </>
      ) : (
        <div className="empty-state">
          {userRole === 'editor' ? (
            <div className="empty-message">
              <h2>No projects yet</h2>
              <p>Click the "New Project" button to create your first project.</p>
            </div>
          ) : (
            <div className="empty-message">
              <h2>No projects available</h2>
              <p>Check back later for updates.</p>
            </div>
          )}
        </div>
      )}
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
    </div>
  );
};

export default Roadmap; 