import React, { useEffect, useState } from 'react';
import BlogCard from '../components/BlogCard';
import { fetchBlogs } from '../services/api';

const Home = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadBlogs = async () => {
      try {
        setLoading(true);
        const data = await fetchBlogs();
        setBlogs(data.blogs || []);
      } catch (err) {
        console.error('Error fetching blogs:', err);
        setError('Failed to load blogs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    loadBlogs();
  }, []);

  return (
    <main>
      <h1>All Blogs</h1>
      {error && (
        <div className="container mb-4">
          <div className="alert alert-danger">{error}</div>
        </div>
      )}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-gray)' }}>
          <p>Loading blogs...</p>
        </div>
      ) : blogs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-title">No blogs published yet</div>
          <p>Be the first to publish a blog story!</p>
        </div>
      ) : (
        <div className="blog-grid">
          {blogs.map((blog) => (
            <BlogCard key={blog._id} blog={blog} />
          ))}
        </div>
      )}
    </main>
  );
};

export default Home;
