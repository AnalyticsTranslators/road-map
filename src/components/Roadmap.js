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

const Roadmap = () => {
  const [activeProject, setActiveProject] = useState(0);
  const roadRef = useRef(null);
  const containerRef = useRef(null);
  
  const projects = [
    {
      id: 1,
      name: "PRiSM",
      summary: "A Python-based exposure modeling tool using Bloomberg data for inputs, simulating profit impact scenarios where the client is exposed to multiple underlying exposures.",
      goals: Object.values(TEAM_GOALS),
      milestones: [
        {
          id: 1,
          title: "Investigation Phase",
          description: "Investigated the original PRISM tool, extracted valuable insights and derived modeling logic",
          completion: 100,
          date: "March 2024"
        },
        {
          id: 2,
          title: "Rebuild Phase",
          description: "The rebuilding of PRiSM started using Python via a Bloomberg connection, which was similar to the original PRISM tool. The aim was to replicate all of the useful features of the original PRISM tool.",
          completion: 100,
          date: "April - June 2024"
        },
        {
          id: 3,
          title: "Client Engagement on POC Phase",
          description: "The goal is to collaborate with the clients on the completed work. Features include: Correlations between exposures, Exposure volatilities, Sizes of exposures.",
          completion: 100,
          date: "May 2024"
        },
        {
          id: 4,
          title: "Mean Reversion (FX & Rates)",
          description: "Incorporate Hull-White model for rates and FX, develop a custom methodology and test with client debt.",
          completion: 100,
          date: "October 2024"
        },
        {
            id: 5,
            title: "Model Validation",
            description: "Getting independent validation of the model is critical to ensure we can proceed with client engagement.",
            completion: 100,
            date: "November - December 2024"
          },
          {
            id: 6,
            title: "New Product DCF",
            description: "Product requirements: CTO/BM Involvement, Budgeting, Server (VDI), Compliance",
            completion: 20,
            date: "January 2025"
          },
          {
            id: 7,
            title: "Proxy Hedge Recommendation System",
            description: "System to be able to calculate the correlations between hedgable commoditiies and an unhedgable commodity and recommend the best proxy hedge.",
            completion: 20,
            date: "January 2025"
          }
      ]
    },
    {
        id: 2,
        name: "EventLens",
        summary: "To be continued...",
        goals: [TEAM_GOALS.THOUGHT_LEADER, TEAM_GOALS.CLIENT_CONVERSATIONS],
        milestones: [
          {
            id: 1,
            title: "Test",
            description: "To be continued...",
            completion: 100,
            date: "March 2024"
          }
        ]
      },
  ];

  useEffect(() => {
    const road = roadRef.current;
    const container = containerRef.current;
    const milestones = road.querySelectorAll('.milestone');
    const car = road.querySelector('.car');

    // Reset any existing animations
    gsap.killTweensOf(car);
    gsap.killTweensOf(milestones);

    // Calculate first milestone position (accounting for the milestone height)
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

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [activeProject]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error.message);
    }
  };

  return (
    <div className="roadmap-container" ref={containerRef}>
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
        </div>
        <div className="project-summary">
          {projects[activeProject].summary}
        </div>
      </div>
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
        <div className="car">
          <div className="car-icon">🚗</div>
        </div>
        {projects[activeProject].milestones.map((milestone, index) => (
          <div 
            key={milestone.id}
            className="milestone"
            style={{ 
              top: `${(index * 100) / (projects[activeProject].milestones.length - 1)}%`,
              opacity: 1
            }}
          >
            <div className="milestone-point"></div>
            <div className="milestone-content">
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
      <button onClick={handleSignOut} className="sign-out-button">Sign Out</button>
    </div>
  );
};

export default Roadmap; 