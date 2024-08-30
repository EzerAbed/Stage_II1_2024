import React, { useEffect } from 'react';
import {
  Routes,
  Route,
  useLocation
} from 'react-router-dom';

import './css/style.css';

import './charts/ChartjsConfig';

import Layout from './Layout';

// Import pages
import Dashboard from './pages/Dashboard';
import AddProduct from './pages/AddProduct';
import AddCategory from './pages/AddCategory';
import ProductList from './pages/ProductList';
import CustumersPage from './pages/CustumersPage';
import CreatePromotion from './pages/CreatePromotion';
import Orders from './pages/Orders';
import Transporter from './pages/Transporter';
import Shipment from './pages/Shipment';
import Reviews from './pages/Reviews';
import UpdateShippment from './pages/UpdateShippment';

function App() {

  const location = useLocation();

  useEffect(() => {
    document.querySelector('html').style.scrollBehavior = 'auto'
    window.scroll({ top: 0 })
    document.querySelector('html').style.scrollBehavior = ''
  }, [location.pathname]); // triggered on route change

  return (
    <>
      <Routes>
        <Route path='/' element={<Layout/>}>
          <Route index element={<Dashboard />} />
          <Route  path ="/add-product" element={<AddProduct />} />
          <Route path ="/category" element={<AddCategory />} />
          <Route path ="/products" element={<ProductList />} />
          <Route path ="/custumers" element={<CustumersPage />} />
          <Route path ="/create-promotion" element={<CreatePromotion />} />
          <Route path ="/orders" element={<Orders />} />
          <Route path ="/transporter" element={<Transporter />} />
          <Route path ="/shipment/:order_id" element={<Shipment />} />
          <Route path ="/reviews" element={<Reviews />} />
          <Route path ="/updateshipment/:order_id" element={<UpdateShippment />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
