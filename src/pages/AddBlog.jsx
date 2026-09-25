import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createBlog } from '../services/api';

const AddBlog = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setError('Please provide both a title and blog content');
      return;
    }
    if (!coverImage) {
      setError('Cover image is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const formData = new FormData();
      formData.append('title', title);
      formData.append('body', body);
      formData.append('coverImage', coverImage);

      const res = await createBlog(formData);
      if (res.blogId) {
        navigate(`/blog/${res.blogId}`);
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Create blog error:', err);
      setError(err.message || 'Failed to create blog');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main>
      <div className="add-container">
        <div className="header-section">
          <h1>➕ Create New Blog Post</h1>
        </div>

        {error && <div className="alert alert-error mb-4">{error}</div>}

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="form-section">
            <div className="form-section-title">Blog Cover Image</div>
            <div className="mb-3">
              <label htmlFor="coverImage" className="form-label">
                Cover Image
              </label>
              <input
                type="file"
                className="form-control"
                id="coverImage"
                name="coverImage"
                accept="image/*"
                onChange={(e) => setCoverImage(e.target.files[0])}
                required
              />
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-title">Blog Title</div>
            <div className="mb-3">
              <label htmlFor="title" className="form-label">
                Title
              </label>
              <input
                type="text"
                className="form-control"
                id="title"
                name="title"
                placeholder="Enter your blog title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-title">Blog Content</div>
            <div className="mb-3">
              <label htmlFor="body" className="form-label">
                Body
              </label>
              <textarea
                className="form-control"
                id="body"
                name="body"
                placeholder="Write your blog content..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
              ></textarea>
            </div>
          </div>

          <div className="button-group">
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Publishing...' : '✅ Publish Blog'}
            </button>
            <Link to="/" className="btn btn-secondary">
              ← Back to Home
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
};

export default AddBlog;
