import React, { useState, useEffect } from 'react';
import Prod from '../components/Prod'; 

const Shop = () => {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedSubcategory, setSelectedSubcategory] = useState('All');
  const [priceRange, setPriceRange] = useState('All');
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    // Fetch categories from the backend
    fetch('http://localhost:3005/categories')
      .then((response) => response.json())
      .then((data) => setCategories(data))
      .catch((error) => console.error('Error fetching categories:', error))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (selectedFilter !== 'All') {
      // Fetch subcategories when a category is selected
      fetch(`http://localhost:3005/sub_categories/category/${selectedFilter}`)
        .then((response) => response.json())
        .then((data) => setSubcategories(data))
        .catch((error) => console.error('Error fetching subcategories:', error));
    } else {
      setSubcategories([]); // Reset subcategories when "All" is selected
    }
  }, [selectedFilter]);

  useEffect(() => {
    setIsLoading(true);
    // Fetch all products from the backend
    fetch('http://localhost:3003/products')
      .then((response) => response.json())
      .then((data) => {
        // For each product, fetch its primary image
        const productWithImagesPromises = data.map(product => 
          fetch(`http://localhost:3003/products/${product.id}/primary-image`)
            .then(response => response.json())
            .then(imageData => ({
              ...product,
              image: imageData.image_path,
            }))
            .catch(() => ({
              ...product,
              image: null, // If there's an error, or no image, just set to null
            }))
        );

        // Wait for all images to be fetched
        Promise.all(productWithImagesPromises)
          .then(productsWithImages => setProducts(productsWithImages))
          .finally(() => setIsLoading(false));

          console.log('fetched products :', products)
      })
      .catch((error) => console.error('Error fetching products:', error));
  }, []);

  const handleFilterChange = (event) => {
    setSelectedFilter(event.target.value);
    setSelectedSubcategory('All'); // Reset subcategory when category changes
  };

  const handleSubcategoryChange = (event) => {
    setSelectedSubcategory(event.target.value);
  };

  const handlePriceChange = (event) => {
    setPriceRange(event.target.value);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Filter products based on selected category, subcategory, and price range
  const filteredProducts = products.filter((product) => {
    return (
      (selectedFilter === 'All' || product.category_id === selectedFilter) &&
      (selectedSubcategory === 'All' || product.subcategory_id === selectedSubcategory) &&
      (priceRange === 'All' ||
        (priceRange === '100-500' && product.price >= 100 && product.price <= 500) ||
        (priceRange === '500-1000' && product.price > 500 && product.price <= 1000) ||
        (priceRange === '1000-above' && product.price > 1000))
    );
  });

  return (
    <>
      <button className="btn btn-primary" onClick={toggleSidebar}>
        {isSidebarOpen ? 'Close Filters' : 'Open Filters'}
      </button>

      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <section className="filter-options p-3">
          <div className="container-xxl">
            <div className="row mb-4">
              <div className="col-12">
                <div className="d-flex flex-column mb-3">
                  {/* Filtrage par catégorie */}
                  <div className="form-check mb-2">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="filter"
                      id="all"
                      value="All"
                      checked={selectedFilter === 'All'}
                      onChange={handleFilterChange}
                    />
                    <label className="form-check-label" htmlFor="all">
                      All
                    </label>
                  </div>
                  {categories.map((category) => (
                    <div className="form-check mb-2" key={category.id}>
                      <input
                        className="form-check-input"
                        type="radio"
                        name="filter"
                        id={category.id}
                        value={category.id}
                        checked={selectedFilter === category.id}
                        onChange={handleFilterChange}
                      />
                      <label className="form-check-label" htmlFor={category.id}>
                        {category.name}
                      </label>
                    </div>
                  ))}
                </div>

                {/* Filtrage par sous-catégorie */}
                {selectedFilter !== 'All' && (
                  <div className="d-flex flex-column mb-3">
                    <div className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="subcategory"
                        id="subAll"
                        value="All"
                        checked={selectedSubcategory === 'All'}
                        onChange={handleSubcategoryChange}
                      />
                      <label className="form-check-label" htmlFor="subAll">
                        All Subcategories
                      </label>
                    </div>
                    {subcategories.map((subcategory) => (
                      <div className="form-check mb-2" key={subcategory.id}>
                        <input
                          className="form-check-input"
                          type="radio"
                          name="subcategory"
                          id={subcategory.id}
                          value={subcategory.id}
                          checked={selectedSubcategory === subcategory.id}
                          onChange={handleSubcategoryChange}
                        />
                        <label className="form-check-label" htmlFor={subcategory.id}>
                          {subcategory.name}
                        </label>
                      </div>
                    ))}
                  </div>
                )}

                {/* Filtrage par plage de prix */}
                <div className="d-flex flex-column mb-3">
                  <div className="form-check mb-2">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="price"
                      id="priceAll"
                      value="All"
                      checked={priceRange === 'All'}
                      onChange={handlePriceChange}
                    />
                    <label className="form-check-label" htmlFor="priceAll">
                      All Prices
                    </label>
                  </div>
                  <div className="form-check mb-2">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="price"
                      id="100-500"
                      value="100-500"
                      checked={priceRange === '100-500'}
                      onChange={handlePriceChange}
                    />
                    <label className="form-check-label" htmlFor="100-500">
                      $100 - $500
                    </label>
                  </div>
                  <div className="form-check mb-2">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="price"
                      id="500-1000"
                      value="500-1000"
                      checked={priceRange === '500-1000'}
                      onChange={handlePriceChange}
                    />
                    <label className="form-check-label" htmlFor="500-1000">
                      $500 - $1000
                    </label>
                  </div>
                  <div className="form-check mb-2">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="price"
                      id="1000-above"
                      value="1000-above"
                      checked={priceRange === '1000-above'}
                      onChange={handlePriceChange}
                    />
                    <label className="form-check-label" htmlFor="1000-above">
                      Above $1000
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="featured-products p-5">
        <div className="container-xxl">
          <div className="row">
            {isLoading ? (
              <div className="col-12 text-center">
                <p>Loading products...</p>
              </div>
            ) : (
              filteredProducts.map(product => (
                <Prod key={product.id} data={product} />
              ))
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default Shop;
