/* eslint-disable no-unused-vars */
import React from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import Layout from './components/layout'
import Home from './pages/home'
import About from './pages/about'
import Shop from './pages/shop'
import Contact from './pages/contact'
import Login from './pages/login'
import Signup from './pages/signup'
import Forgotpasword from './pages/forgotpasword'
import Cart from './pages/cart'
import Checkout from './pages/checkout'
import Blog from './pages/blog'
import './App.css'
import ShopContext from './components/shopcontext'
import Details from './pages/details'
import Profile from './pages/profile'


function ScrollToTop() {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}


function App() {

  return (
    <>
    <ShopContext>
    <BrowserRouter>
    <ScrollToTop />
    <Routes>
      <Route path='/' element={<Layout />}>
        <Route index element={<Home />} />
        <Route path='shop' element={<Shop />} />
        <Route path='blog' element={<Blog />} />
        <Route path='about' element={<About />} />
        <Route path='contact' element={<Contact />} />
        <Route path='login' element={<Login />} />
        <Route path='signup' element={<Signup />} />
        <Route path='forgotpasword' element={<Forgotpasword />} />
        <Route path='cart/:id' element={<Cart />} />
        <Route path='checkout/:totalAmount' element={<Checkout />} />
        <Route path='details/:id' element={<Details />} />
        <Route path='profile' element={<Profile />} />  
      </Route>
    </Routes>
    </BrowserRouter>
    </ShopContext>
    
    </>
  )
}

export default App
