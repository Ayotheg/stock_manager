   // Data storage
        let products = JSON.parse(localStorage.getItem('shopProducts')) || [];

        // Initialize app
        document.addEventListener('DOMContentLoaded', function() {
            loadProducts();
            updateStats();
            
            document.getElementById('addProductForm').addEventListener('submit', function(e) {
                e.preventDefault();
                addProduct();
            });

            document.getElementById('searchBox').addEventListener('keyup', function() {
                const query = this.value.toLowerCase();
                if (query.length > 0) {
                    searchProducts(query);
                }
            });
        });

        // Screen navigation
        function showScreen(screenId) {
            document.querySelectorAll('.screen').forEach(screen => {
                screen.classList.remove('active');
            });
            document.getElementById(screenId).classList.add('active');
            
            if (screenId === 'listScreen') loadProducts();
            if (screenId === 'editScreen') loadEditProducts();
            if (screenId === 'suppliersScreen') loadSuppliers();
        }

        // Image preview
        function previewImage(input) {
            if (input.files && input.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    document.getElementById('imagePreview').innerHTML = 
                        `<img src="${e.target.result}" class="image-preview" alt="Preview">
                         <div class="upload-text">Tap to change</div>`;
                };
                reader.readAsDataURL(input.files[0]);
            }
        }

        // Add product
        function addProduct() {
            const product = {
                id: Date.now(),
                name: document.getElementById('productName').value,
                price: parseFloat(document.getElementById('productPrice').value),
                supplier: document.getElementById('supplierName').value,
                phone: document.getElementById('supplierPhone').value,
                notes: document.getElementById('productNotes').value,
                image: document.getElementById('imagePreview').querySelector('img')?.src || null,
                dateAdded: new Date().toISOString(),
                lastUpdated: new Date().toISOString()
            };

            products.push(product);
            saveProducts();
            updateStats();
            
            // Reset form
            document.getElementById('addProductForm').reset();
            document.getElementById('imagePreview').innerHTML = 
                `<div class="upload-icon">📷</div>
                 <div class="upload-text">Tap to add image</div>`;
            
            alert('Product added successfully');
            showScreen('homeScreen');
        }

        // Save to localStorage
        function saveProducts() {
            localStorage.setItem('shopProducts', JSON.stringify(products));
        }

        // Load products
        function loadProducts() {
            const productList = document.getElementById('productList');
            productList.innerHTML = '';

            if (products.length === 0) {
                productList.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">📦</div>
                        <div class="empty-title">No products yet</div>
                        <div class="empty-text">Add your first product to get started</div>
                    </div>`;
                return;
            }

            products.forEach(product => {
                const productElement = createProductElement(product);
                productList.appendChild(productElement);
            });
        }

        // Create product element
        function createProductElement(product) {
            const div = document.createElement('div');
            div.className = 'product-item';
            div.innerHTML = `
                <img src="${product.image || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50"><rect width="50" height="50" fill="%23333"/></svg>'}" class="product-image" alt="${product.name}">
                <div class="product-details">
                    <div class="product-name">${product.name}</div>
                    <div class="product-price">₦${product.price.toFixed(2)}</div>
                    <div class="product-supplier">${product.supplier}</div>
                </div>
                <div class="product-actions">
                    <button class="btn-small btn-edit" onclick="editProduct(${product.id})">Edit</button>
                    <button class="btn-small btn-call" onclick="callSupplier('${product.phone}')" ${!product.phone ? 'disabled' : ''}>Call</button>
                    <button class="btn-small btn-delete" onclick="deleteProduct(${product.id})">Del</button>
                </div>
            `;
            return div;
        }

        // Update stats
        function updateStats() {
            document.getElementById('totalProducts').textContent = products.length;
            const uniqueSuppliers = new Set(products.map(p => p.supplier));
            document.getElementById('totalSuppliers').textContent = uniqueSuppliers.size;
        }

        // Search products
        function searchProducts(query) {
            const results = products.filter(product => 
                product.name.toLowerCase().includes(query) ||
                product.supplier.toLowerCase().includes(query)
            );
            
            if (results.length > 0) {
                showScreen('listScreen');
                const productList = document.getElementById('productList');
                productList.innerHTML = '';
                results.forEach(product => {
                    const productElement = createProductElement(product);
                    productList.appendChild(productElement);
                });
            }
        }

        // Filter products
        function filterProducts() {
            const query = document.getElementById('productSearchBox').value.toLowerCase();
            const productItems = document.querySelectorAll('#productList .product-item');
            
            productItems.forEach(item => {
                const productName = item.querySelector('.product-name').textContent.toLowerCase();
                const supplierName = item.querySelector('.product-supplier').textContent.toLowerCase();
                
                if (productName.includes(query) || supplierName.includes(query)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        }

        // Edit product
        function editProduct(id) {
            const product = products.find(p => p.id === id);
            if (!product) return;

            const newPrice = prompt(`Update price for ${product.name}:\nCurrent: ₦${product.price.toFixed(2)}`, product.price);
            
            if (newPrice !== null && !isNaN(newPrice) && newPrice > 0) {
                product.price = parseFloat(newPrice);
                product.lastUpdated = new Date().toISOString();
                saveProducts();
                loadProducts();
                alert('Price updated');
            }
        }

        // Call supplier
        function callSupplier(phone) {
            if (phone) {
                window.open(`tel:${phone}`);
            } else {
                alert('No phone number available');
            }
        }

        // Delete product
        function deleteProduct(id) {
            if (confirm('Delete this product?')) {
                products = products.filter(p => p.id !== id);
                saveProducts();
                loadProducts();
                updateStats();
            }
        }

        // Load edit products
        function loadEditProducts() {
            const editList = document.getElementById('editProductList');
            editList.innerHTML = '';

            if (products.length === 0) {
                editList.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">✎</div>
                        <div class="empty-title">No products to edit</div>
                        <div class="empty-text">Add products first</div>
                    </div>`;
                return;
            }

            products.forEach(product => {
                const div = document.createElement('div');
                div.className = 'product-item';
                div.innerHTML = `
                    <img src="${product.image || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50"><rect width="50" height="50" fill="%23333"/></svg>'}" class="product-image" alt="${product.name}">
                    <div class="product-details">
                        <div class="product-name">${product.name}</div>
                        <div class="product-price">₦${product.price.toFixed(2)}</div>
                        <div class="product-supplier">${product.supplier}</div>
                    </div>
                    <div class="product-actions">
                        <button class="btn-small btn-edit" onclick="editProduct(${product.id})">Edit Price</button>
                    </div>
                `;
                editList.appendChild(div);
            });
        }

        // Load suppliers
        function loadSuppliers() {
            const suppliersList = document.getElementById('suppliersList');
            suppliersList.innerHTML = '';

            const uniqueSuppliers = {};
            products.forEach(product => {
                if (!uniqueSuppliers[product.supplier]) {
                    uniqueSuppliers[product.supplier] = {
                        name: product.supplier,
                        phone: product.phone,
                        products: []
                    };
                }
                uniqueSuppliers[product.supplier].products.push(product.name);
            });

            if (Object.keys(uniqueSuppliers).length === 0) {
                suppliersList.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">◦</div>
                        <div class="empty-title">No suppliers yet</div>
                        <div class="empty-text">Add products to see suppliers</div>
                    </div>`;
                return;
            }

            Object.values(uniqueSuppliers).forEach(supplier => {
                const div = document.createElement('div');
                div.className = 'supplier-item';
                div.innerHTML = `
                    <div class="supplier-name">${supplier.name}</div>
                    <div class="supplier-details">${supplier.products.length} product(s)</div>
                    <div class="supplier-details">${supplier.phone || 'No phone number'}</div>
                    <div class="supplier-actions">
                        <button class="btn-small btn-call" onclick="callSupplier('${supplier.phone}')" ${!supplier.phone ? 'disabled' : ''}>Call</button>
                    </div>
                `;
                suppliersList.appendChild(div);
            });
        }