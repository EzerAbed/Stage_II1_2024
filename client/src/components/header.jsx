import React, { useContext, useState, useEffect } from 'react';
import { CiMail } from 'react-icons/ci';
import { BiPhoneCall } from 'react-icons/bi';
import { BsSearch } from 'react-icons/bs';
import { VscAccount } from 'react-icons/vsc';
import { CgShoppingCart } from 'react-icons/cg';
import { AiOutlineMenu, AiOutlineClose, AiOutlineDown } from 'react-icons/ai';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/images/apneck.png';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Dropdown, Modal, Button } from 'react-bootstrap';
import UserContext from '../Context/UserContext'
import getTotalCartProducts from '../components/shopcontext'


const Header = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [userCart, setUserCart] = useState(null);
  
  const { user, setUser } = useContext(UserContext);
  const [totalProducts, setTotalProducts] = useState(getTotalCartProducts()) 
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  useEffect(() => {
    const fetchUserCart = async () => {
      try {
        const response = await fetch(`http://localhost:3007/cart/user/${user.id}`);
        if (response.ok) {
          const cartData = await response.json();
          
          setUserCart(cartData);
          // save the userCart in the local storage
          localStorage.setItem('userCartId', JSON.stringify(cartData.id));
        } else {
          console.error('Failed to retrieve the cart');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    if (user) {
      fetchUserCart();
    }else{
      //delete the usercartId in the local storage
      localStorage.removeItem('userCartId');
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:3001/signout', {
        method: 'POST',
        credentials: 'include',
      });
      if (response.ok) {
        setUser(null);
        navigate('/login');
      } else {
        console.error('Failed to log out');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDeleteProfile = async () => {
    try {
      const response = await fetch(`http://localhost:3001/users/${user.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setUser(null);
        navigate('/signup');
      } else {
        console.error('Failed to delete profile');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <>
      <header className='navbar-top p-2'>
        <div className="container-xxl">
          <div className="row">
            <div className="d-flex align-items-center justify-content-between d-md-none">
              <div className="col-md-6 me-auto">
                <p>Save Upto 100%</p>
              </div>
              <div className="col-md-2 m-auto">
                <a href="tel:+">Call us</a>
              </div>
              <div className="col-md-2 m-auto">
                <Link className='links fs-4'><CiMail /></Link>
                <Link className='links fs-4'><BiPhoneCall /></Link>
              </div>
            </div>
          </div>
        </div>
      </header>
      <header className='navbar-middle sticky-top p-2 p-md-2 p-lg-2'>
        <div className="container-xxl">
          <div className="row align-items-center m-0">
            <div className="col-md-2 d-flex justify-content-center">
              <button className="navbar-toggler d-md-none" type="button" onClick={toggleMenu}>
                <span className="navbar-toggler-icon">{showMenu ? <AiOutlineClose /> : <AiOutlineMenu />}</span>
              </button>
              <Link to='/'>
                <img src={logo} alt="logo" className='img-fluid logo' />
              </Link>
              {user && (
                <button className="cart-span fs-3 d-md-none">
                  <Link to='cart' className={location.pathname === '/cart' ? 'active' : 'not-active'}>
                    <CgShoppingCart />
                    <b><span>{totalProducts}</span></b>
                  </Link>
                </button>
              )}
            </div>

            <div className="col-md-10 row col-lg-10">
              <div className="col-md-3 m-auto">
                <div className="input-group d-none d-md-flex">
                  <input type="text" className="form-control" placeholder="Find products ..." aria-label="Find products ..." aria-describedby="basic-addon2" />
                  <button className="input-group-text" id="basic-addon2">search</button>
                </div>
              </div>
              <div className="col-md-6 m-auto">
                <div className='menu-links mt-2 d-none d-md-flex d-lg-flex'>
                  <div className='ms-auto gap-3'><NavLink to="/" className={location.pathname === '/' ? 'active' : 'not-active'} onClick={toggleMenu}>HOME</NavLink></div>
                  <div className='ms-auto gap-3'><NavLink to="/shop" className={location.pathname === '/shop' ? 'active' : 'not-active'} onClick={toggleMenu}>SHOP</NavLink></div>
                  <div className='ms-auto gap-3'><NavLink to="/blog" className={location.pathname === '/blog' ? 'active' : 'not-active'} onClick={toggleMenu}>BLOG</NavLink></div>
                  <div className='ms-auto gap-3'><NavLink to="/about" className={location.pathname === '/about' ? 'active' : 'not-active'} onClick={toggleMenu}>ABOUT</NavLink></div>
                  <div className='ms-auto gap-3'><NavLink to="/contact" className={location.pathname === '/contact' ? 'active' : 'not-active'} onClick={toggleMenu}>CONTACT</NavLink></div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="row d-flex justify-content-center">
                  <div className="col-12 col-md-2 d-none d-md-flex d-lg-flex m-auto">
                    {user ? (
                      <>
                        <Dropdown>
                          <Dropdown.Toggle variant="link" id="dropdown-basic" className="text-dark p-0 d-flex align-items-center">
                            <VscAccount className="fs-3" />
                            <AiOutlineDown className="ms-1 fs-5" />
                          </Dropdown.Toggle>
                          <Dropdown.Menu align="end">
                            <Dropdown.Item onClick={handleLogout}>Disconnect</Dropdown.Item>
                            <Dropdown.Item onClick={() => navigate('/profile')}>Update Profile</Dropdown.Item>
                            <Dropdown.Item onClick={() => setShowDeleteConfirmation(true)} className="text-danger">Delete Profile</Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                        <div className={location.pathname === '/cart' ? 'active' : 'not-active'}>
                          <Link onClick={toggleMenu} to={`/cart/${userCart?.id}`} className="d-flex align-items-center color-nav me-3 cart-span-one">
                            <CgShoppingCart className='me-1 fs-2' />
                            <div>
                              <p><b><span>{totalProducts}</span></b></p>
                            </div>
                          </Link>
                        </div>
                      </>
                    ) : (
                      <Button variant="outline-dark" onClick={() => navigate('/login')}>Login</Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {showMenu && (
              <div className="col-md-10 d-md-none mt-3">
                <div className="input-group mb-3">
                  <input type="text" className="form-control" placeholder="Find products ..." aria-label="Find products ..." aria-describedby="basic-addon2" />
                  <button className="input-group-text" id="basic-addon2">search</button>
                </div>
                <div className='menu-links mt-2'>
                  <div className='mb-2'><NavLink className={location.pathname === '/' ? 'active' : 'not-active'} to="/" onClick={toggleMenu}>HOME</NavLink></div>
                  <div className='mb-2'><NavLink className={location.pathname === '/shop' ? 'active' : 'not-active'} to="/shop" onClick={toggleMenu}>SHOP</NavLink></div>
                  <div className='mb-2'><NavLink className={location.pathname === '/blog' ? 'active' : 'not-active'} to="/blog" onClick={toggleMenu}>BLOG</NavLink></div>
                  <div className='mb-2'><NavLink className={location.pathname === '/about' ? 'active' : 'not-active'} to="/about" onClick={toggleMenu}>ABOUT</NavLink>                  </div>
                  <div className='mb-2'><NavLink className={location.pathname === '/contact' ? 'active' : 'not-active'} to="/contact" onClick={toggleMenu}>CONTACT</NavLink></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <Modal show={showDeleteConfirmation} onHide={() => setShowDeleteConfirmation(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Profile Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete your profile? This action is irreversible.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteConfirmation(false)}>
            No
          </Button>
          <Button variant="danger" onClick={handleDeleteProfile}>
            Yes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Header;

