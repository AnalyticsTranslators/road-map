import React, { useState } from 'react';

const AddStatusModal = ({ isOpen, onClose, onAdd, isLoading, error }) => {
  const [content, setContent] = useState('');
  const [type, setType] = useState(''); // Assuming type is required
  const [projectId, setProjectId] = useState(''); // Assuming project_id is required

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({ content, type, project_id: projectId });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Add Status Update</h2>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          <div className="form-group">
            <label>Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
            >
              <option value="">Select Type</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="blocker">Blocker</option>
              <option value="dependency">Dependency</option>
            </select>
          </div>
          <div className="form-group">
            <label>Project ID</label>
            <input
              type="text"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              required
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStatusModal; 