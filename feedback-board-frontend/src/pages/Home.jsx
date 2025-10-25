import { useState, useEffect } from 'react';
import { getFeedbacks, createFeedback, voteFeedback } from '../services/api';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Home.css';

function Home() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [newFeedback, setNewFeedback] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [userVotes, setUserVotes] = useState(new Set());
  const [isLoadingVotes, setIsLoadingVotes] = useState(true);
  const { user } = useAuth();

  const statuses = ['All', 'Planned', 'In Progress', 'Completed', 'Rejected'];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterFeedbacks();
  }, [selectedStatus, feedbacks]);

  // Load both feedbacks and user votes together
  const loadData = async () => {
    setIsLoadingVotes(true);
    try {
      // Load feedbacks first
      const feedbacksResponse = await getFeedbacks();
      setFeedbacks(feedbacksResponse.data);

      // Load user's votes if authenticated
      if (user) {
        try {
          const votesResponse = await api.get('/feedbacks/user/votes');
          console.log('User votes loaded:', votesResponse.data);
          setUserVotes(new Set(votesResponse.data));
        } catch (voteError) {
          console.error('Error loading user votes:', voteError);
          // If votes endpoint fails, set empty Set
          setUserVotes(new Set());
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoadingVotes(false);
    }
  };

  const filterFeedbacks = () => {
    if (selectedStatus === 'All') {
      setFilteredFeedbacks(feedbacks);
    } else {
      setFilteredFeedbacks(feedbacks.filter(f => f.status === selectedStatus));
    }
  };

  const handleCreateFeedback = async (e) => {
    e.preventDefault();
    if (!newFeedback.title || !newFeedback.description) return;

    setLoading(true);
    try {
      await createFeedback(newFeedback);
      setNewFeedback({ title: '', description: '' });
      setShowModal(false);
      await loadData(); // Reload everything
    } catch (error) {
      console.error('Error creating feedback:', error);
      alert('Failed to create feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (feedbackId) => {
    // Don't allow voting while votes are loading
    if (isLoadingVotes) return;

    const hasVoted = userVotes.has(feedbackId);

    // Store original state for rollback
    const originalVotes = new Set(userVotes);
    const originalFeedbacks = [...feedbacks];

    try {
      // Optimistically update UI
      const newVoted = new Set(userVotes);
      if (hasVoted) {
        newVoted.delete(feedbackId);
      } else {
        newVoted.add(feedbackId);
      }
      setUserVotes(newVoted);

      // Update vote count optimistically
      setFeedbacks(prevFeedbacks => 
        prevFeedbacks.map(f => {
          if (f._id === feedbackId) {
            return {
              ...f,
              votes_count: hasVoted ? Math.max(0, f.votes_count - 1) : f.votes_count + 1
            };
          }
          return f;
        })
      );

      // Call API
      const response = await voteFeedback(feedbackId);
      
      // Update with actual vote count from server
      setFeedbacks(prevFeedbacks => 
        prevFeedbacks.map(f => {
          if (f._id === feedbackId) {
            return {
              ...f,
              votes_count: response.data.votes_count
            };
          }
          return f;
        })
      );
      
    } catch (error) {
      console.error('Error voting:', error);
      // Rollback to original state on error
      setUserVotes(originalVotes);
      setFeedbacks(originalFeedbacks);
      alert('Failed to vote. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Planned': '#3b82f6',
      'In Progress': '#f59e0b',
      'Completed': '#10b981',
      'Rejected': '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  return (
    <div className="home-container">
      <header className="header">
        <h1>Developer Feedback Board</h1>
        <div className="header-actions">
          <span className="user-name">Welcome, {user?.name}!</span>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            + New Feedback
          </button>
        </div>
      </header>

      <div className="filters">
        {statuses.map(status => (
          <button
            key={status}
            className={`filter-btn ${selectedStatus === status ? 'active' : ''}`}
            onClick={() => setSelectedStatus(status)}
          >
            {status}
            {status !== 'All' && (
              <span className="count">
                {feedbacks.filter(f => f.status === status).length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="feedbacks-list">
        {filteredFeedbacks.length === 0 ? (
          <div className="empty-state">
            <p>No feedback found. Be the first to add one!</p>
          </div>
        ) : (
          filteredFeedbacks.map(feedback => {
            const hasVoted = userVotes.has(feedback._id);
            
            return (
              <div key={feedback._id} className="feedback-card">
                <div className="feedback-vote">
                  <button
                    className={`vote-btn ${hasVoted ? 'voted' : ''}`}
                    onClick={() => handleVote(feedback._id)}
                    disabled={isLoadingVotes}
                    title={hasVoted ? "Remove your vote" : "Vote for this"}
                  >
                    ▲
                  </button>
                  <span className="vote-count">{feedback.votes_count || 0}</span>
                </div>
                
                <div className="feedback-content">
                  <h3>{feedback.title}</h3>
                  <p>{feedback.description}</p>
                  <div className="feedback-meta">
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(feedback.status) }}
                    >
                      {feedback.status}
                    </span>
                    <span className="author">by {feedback.created_by?.name || 'Unknown'}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Feedback</h2>
            <form onSubmit={handleCreateFeedback}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={newFeedback.title}
                  onChange={(e) => setNewFeedback({ ...newFeedback, title: e.target.value })}
                  placeholder="e.g., Add dark mode"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newFeedback.description}
                  onChange={(e) => setNewFeedback({ ...newFeedback, description: e.target.value })}
                  placeholder="Describe your feedback in detail..."
                  rows={4}
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Creating...' : 'Create Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;