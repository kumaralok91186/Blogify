import React from 'react';
import { Link } from 'react-router-dom';

const BlogCard = ({ blog }) => {
  const authorName = blog.createdBy?.fullName || 'User';
  const avatarUrl =
    blog.createdBy?.profileImageURL ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=1e40af&color=fff&size=32`;

  const excerpt = blog.body ? blog.body.substring(0, 100) + '...' : '';
  const dateFormatted = blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : '';

  return (
    <div className="blog-card">
      <div className="blog-card-image">
        <img src={blog.coverImageURL} alt={blog.title} />
      </div>
      <div className="blog-card-content">
        <h3 className="blog-card-title">{blog.title}</h3>
        <p className="blog-card-excerpt">{excerpt}</p>
        <div className="blog-card-meta">
          <img src={avatarUrl} alt={authorName} className="blog-card-avatar" />
          <span className="blog-card-author">{authorName}</span>
          <span className="blog-card-date">{dateFormatted}</span>
        </div>
        <Link to={`/blog/${blog._id}`} className="blog-card-link">
          Read More →
        </Link>
      </div>
    </div>
  );
};

export default BlogCard;
