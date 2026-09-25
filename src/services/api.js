// API Service Layer for Blogify React Frontend

export async function fetchCurrentAuthUser() {
  const response = await fetch('/api/user/me', {
    headers: { 'Accept': 'application/json' },
  });
  if (!response.ok) throw new Error('Failed to fetch auth user');
  return response.json();
}

export async function signInUser(email, password) {
  const response = await fetch('/api/user/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok || data.error) {
    throw new Error(data.error || 'Failed to sign in');
  }
  return data;
}

export async function signUpUser(fullName, email, password) {
  const response = await fetch('/api/user/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fullName, email, password }),
  });
  const data = await response.json();
  if (!response.ok || data.error) {
    throw new Error(data.error || 'Failed to sign up');
  }
  return data;
}

export async function logoutUser() {
  const response = await fetch('/api/user/logout', {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Failed to log out');
  return response.json();
}

export async function fetchBlogs() {
  const response = await fetch('/api/blogs', {
    headers: { 'Accept': 'application/json' },
  });
  if (!response.ok) throw new Error('Failed to fetch blogs');
  return response.json();
}

export async function fetchBlogById(id) {
  const response = await fetch(`/api/blogs/${id}`, {
    headers: { 'Accept': 'application/json' },
  });
  if (!response.ok) throw new Error('Failed to fetch blog');
  return response.json();
}

export async function createBlog(formData) {
  const response = await fetch('/api/blogs', {
    method: 'POST',
    body: formData,
  });
  const data = await response.json();
  if (!response.ok || data.error) {
    throw new Error(data.error || 'Failed to create blog');
  }
  return data;
}

export async function updateBlog(id, formData) {
  const response = await fetch(`/api/blogs/edit/${id}`, {
    method: 'POST',
    body: formData,
  });
  const data = await response.json();
  if (!response.ok || data.error) {
    throw new Error(data.error || 'Failed to update blog');
  }
  return data;
}

export async function deleteBlog(id) {
  const response = await fetch(`/api/blogs/delete/${id}`, {
    method: 'POST',
  });
  const data = await response.json();
  if (!response.ok || data.error) {
    throw new Error(data.error || 'Failed to delete blog');
  }
  return data;
}

export async function addComment(blogId, content) {
  const response = await fetch(`/api/comments/${blogId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  const data = await response.json();
  if (!response.ok || data.error) {
    throw new Error(data.error || 'Failed to post comment');
  }
  return data;
}

export async function updateComment(commentId, content) {
  const response = await fetch(`/api/comments/update/${commentId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  const data = await response.json();
  if (!response.ok || data.error) {
    throw new Error(data.error || 'Failed to update comment');
  }
  return data;
}

export async function deleteComment(commentId) {
  const response = await fetch(`/api/comments/delete/${commentId}`, {
    method: 'POST',
  });
  const data = await response.json();
  if (!response.ok || data.error) {
    throw new Error(data.error || 'Failed to delete comment');
  }
  return data;
}
