import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  fetchBlogById,
  deleteBlog,
  addComment,
  updateComment,
  deleteComment,
} from '../services/api';
import EditCommentModal from '../components/EditCommentModal';

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New comment input
  const [newCommentContent, setNewCommentContent] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  // Edit comment state
  const [editingComment, setEditingComment] = useState(null); // { id, content }
  const [modalSubmitting, setModalSubmitting] = useState(false);

  const loadBlogData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchBlogById(id);
      setBlog(data.blog);
      setComments(data.comments || []);
    } catch (err) {
      console.error('Error loading blog detail:', err);
      setError('Blog post not found or error loading data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlogData();
  }, [id]);

  const handleDeleteBlog = async () => {
    if (window.confirm('Delete this blog? This cannot be undone.')) {
      try {
        await deleteBlog(id);
        navigate('/');
      } catch (err) {
        alert(err.message || 'Failed to delete blog');
      }
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newCommentContent.trim()) return;

    try {
      setCommentSubmitting(true);
      const res = await addComment(id, newCommentContent);
      if (res.comment) {
        setComments((prev) => [...prev, res.comment]);
      } else {
        await loadBlogData();
      }
      setNewCommentContent('');
    } catch (err) {
      alert(err.message || 'Failed to post comment');
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleSaveEditedComment = async (updatedContent) => {
    if (!editingComment) return;
    try {
      setModalSubmitting(true);
      const res = await updateComment(editingComment.id, updatedContent);
      setComments((prev) =>
        prev.map((c) => (c._id === editingComment.id ? res.comment || { ...c, content: updatedContent } : c))
      );
      setEditingComment(null);
    } catch (err) {
      alert(err.message || 'Failed to update comment');
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Delete this comment?')) {
      try {
        await deleteComment(commentId);
        setComments((prev) => prev.filter((c) => c._id !== commentId));
      } catch (err) {
        alert(err.message || 'Failed to delete comment');
      }
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-gray)' }}>
        <p>Loading blog post...</p>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="blog-container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div className="alert alert-danger">{error || 'Blog not found'}</div>
        <Link to="/" className="btn btn-primary mt-3">
          ← Back to Home
        </Link>
      </div>
    );
  }

  const isAuthor = user && blog.createdBy && (user._id === blog.createdBy._id || user._id === blog.createdBy);
  const authorName = blog.createdBy?.fullName || 'User';
  const authorAvatar =
    blog.createdBy?.profileImageURL ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=1e40af&color=fff&size=40`;

  return (
    <>
      {/* Blog Header */}
      <div className="blog-header">
        <div className="blog-header-content">
          <h1 className="blog-title">{blog.title}</h1>
          <div className="blog-meta">
            <div className="meta-item">
              <img src={authorAvatar} alt={authorName} className="meta-avatar" />
              <span className="meta-text">{authorName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="blog-container">
        <img src={blog.coverImageURL} alt={blog.title} className="blog-cover" />

        <div className="blog-body">
          <pre>{blog.body}</pre>
        </div>

        <div className="blog-divider"></div>

        {/* Author Card */}
        <div className="author-section">
          <img src={authorAvatar} alt={authorName} className="author-avatar" />
          <div className="author-info">
            <h3>{authorName}</h3>
            <p>Blog Author</p>
          </div>
        </div>

        {/* Action Buttons */}
        {isAuthor && (
          <div className="action-buttons">
            <Link to={`/blog/edit/${blog._id}`} className="btn btn-sm btn-warning">
              ✏️ Edit Blog
            </Link>
            <button onClick={handleDeleteBlog} className="btn btn-sm btn-danger">
              🗑️ Delete Blog
            </button>
          </div>
        )}

        {/* Comments Section */}
        <div className="comments-section">
          <h2 className="comments-title">💬 Comments ({comments.length})</h2>

          {user ? (
            <div className="comment-form">
              <label className="comment-form-label">Join the discussion</label>
              <form onSubmit={handlePostComment}>
                <div className="comment-input-group">
                  <input
                    type="text"
                    name="content"
                    className="form-control"
                    placeholder="Share your thoughts on this article..."
                    value={newCommentContent}
                    onChange={(e) => setNewCommentContent(e.target.value)}
                    required
                  />
                  <button className="btn btn-primary btn-sm" type="submit" disabled={commentSubmitting}>
                    {commentSubmitting ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="comment-form">
              <div className="empty-state-link">
                <p>
                  <Link to="/user/signin">Sign in</Link> to leave a comment
                </p>
              </div>
            </div>
          )}

          <div className="comment-list">
            {comments.length > 0 ? (
              comments.map((comment) => {
                const commentAuthorName = comment.createdBy?.fullName || 'User';
                const commentAvatar =
                  comment.createdBy?.profileImageURL ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(commentAuthorName)}&background=1e40af&color=fff&size=36`;
                const isCommentAuthor =
                  user &&
                  comment.createdBy &&
                  (user._id === comment.createdBy._id || user._id === comment.createdBy);

                return (
                  <div className="comment-item" key={comment._id}>
                    <div className="comment-header">
                      <img src={commentAvatar} alt={commentAuthorName} className="comment-avatar" />
                      <span className="comment-author-name">{commentAuthorName}</span>
                    </div>
                    <div className="comment-content">{comment.content}</div>

                    {isCommentAuthor && (
                      <div className="comment-actions">
                        <button
                          className="comment-btn comment-btn-edit"
                          onClick={() => setEditingComment({ id: comment._id, content: comment.content })}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="comment-btn comment-btn-delete"
                          onClick={() => handleDeleteComment(comment._id)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="empty-state">
                <div className="empty-state-title">No comments yet</div>
                <p>Be the first to share your thoughts on this article!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Comment Modal */}
      <EditCommentModal
        isOpen={Boolean(editingComment)}
        initialContent={editingComment?.content || ''}
        onSave={handleSaveEditedComment}
        onClose={() => setEditingComment(null)}
        isSubmitting={modalSubmitting}
      />
    </>
  );
};

export default BlogDetail;
