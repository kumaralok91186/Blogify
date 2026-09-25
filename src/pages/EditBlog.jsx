import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchBlogById, updateBlog } from '../services/api';

const EditBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [currentCoverUrl, setCurrentCoverUrl] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadBlog = async () => {
      try {
        setLoading(true);
        const data = await fetchBlogById(id);
        if (data.blog) {
          setTitle(data.blog.title || '');
          setBody(data.blog.body || '');
          setCurrentCoverUrl(data.blog.coverImageURL || '');
        }
      } catch (err) {
        console.error('Error fetching blog for edit:', err);
        setError('Blog post not found or error loading post.');
      } finally {
        setLoading(false);
      }
    };
    loadBlog();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setError('Title and Content are required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const formData = new FormData();
      formData.append('title', title);
      formData.append('body', body);
      if (coverImage) {
        formData.append('coverImage', coverImage);
      }

      await updateBlog(id, formData);
      navigate(`/blog/${id}`);
    } catch (err) {
      console.error('Error updating blog:', err);
      setError(err.message || 'Failed to update blog');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main>
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-gray)' }}>
          <p>Loading blog details...</p>
        </div>
      </main>
    );
  }

  if (error && !title) {
    return (
      <main>
        <div className="alert alert-error">{error}</div>
        <Link to="/" className="btn btn-primary">
          ← Back to Home
        </Link>
      </main>
    );
  }

  return (
    <main>
      <div className="edit-container">
        <div className="header-section">
          <h1>✏️ Edit Blog Post</h1>
          <Link to={`/blog/${id}`} className="breadcrumb-link">
            ← Back to Blog
          </Link>
        </div>

        {error && <div className="alert alert-error mb-4">{error}</div>}

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          {/* Blog Title Section */}
          <div className="form-section">
            <div className="form-section-title">Blog Title</div>
            <div className="form-group">
              <label htmlFor="title">Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter your blog title..."
                required
              />
            </div>
          </div>

          {/* Blog Content Section */}
          <div className="form-section">
            <div className="form-section-title">Blog Content</div>
            <div className="form-group">
              <label htmlFor="body">Content *</label>
              <textarea
                id="body"
                name="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your blog content here..."
                required
              ></textarea>
            </div>
          </div>

          {/* Cover Image Section */}
          <div className="form-section">
            <div className="form-section-title">Cover Image</div>

            {currentCoverUrl && (
              <div className="current-cover">
                <label>Current Cover Image:</label>
                <img src={currentCoverUrl} alt="Current Cover" />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="coverImage">Upload New Cover Image (Optional)</label>
              <input
                type="file"
                id="coverImage"
                name="coverImage"
                accept="image/*"
                onChange={(e) => setCoverImage(e.target.files[0])}
              />
              <div className="cover-hint">
                💡 Leave empty to keep the existing image. Supported formats: JPEG, PNG, WebP, GIF (Max 10MB)
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="button-group">
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : '💾 Save Changes'}
            </button>
            <Link to={`/blog/${id}`} className="btn btn-secondary" style={{ textDecoration: 'none' }}>
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
};

export default EditBlog;
