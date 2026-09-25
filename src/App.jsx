import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import BlogDetail from './pages/BlogDetail';
import AddBlog from './pages/AddBlog';
import EditBlog from './pages/EditBlog';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/blog/:id" element={<BlogDetail />} />
            <Route path="/blog/add-new" element={<AddBlog />} />
            <Route path="/blog/edit/:id" element={<EditBlog />} />
            <Route path="/user/signin" element={<SignIn />} />
            <Route path="/user/signup" element={<SignUp />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
