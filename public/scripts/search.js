const productosContainerSearch = document.getElementById('productosSearch');

// Funcionalidad de búsqueda
class SearchHandler {
    constructor() {
        this.setupSearch();
        // this.setupMobileSearch();
    }

    setupSearch() {
        const searchForm = document.getElementById('searchForm');
        const searchInput = document.getElementById('searchInput');

        searchForm.addEventListener('submit', (e) => {
            productosContainerSearch.innerHTML = '';
            e.preventDefault();
            this.performSearch(searchInput.value);
        });
        // {
        searchInput.addEventListener('input', (e) => {
            productosContainerSearch.innerHTML = '';
            if (e.target.value.length >= 2) {
                this.performSearch(e.target.value);
            } else if (e.target.value.length === 0) {
                this.clearSearch();
            }
        });
    }

    // setupMobileSearch() {
    //     const searchForm = document.getElementById('mobileSearchForm');
    //     const searchInput = document.getElementById('mobileSearchInput');

    //     searchForm.addEventListener('submit', (e) => {
    //         e.preventDefault();
    //         this.performSearch(searchInput.value);
    //         // Cerrar menú mobile
    //         document.getElementById('mobileMenu').classList.remove('active');
    //     });

    //     searchInput.addEventListener('input', (e) => {
    //         productosContainerSearch.innerHTML = '';
    //         if (e.target.value.length >= 2) {
    //             this.performSearch(e.target.value);
    //         } else if (e.target.value.length === 0) {
    //             this.clearSearch();
    //         }
    //     });
    // }

    async performSearch(query) {
        try {
            const response = await fetch(`${API_BASE_URL}/catalogo/search?q=${encodeURIComponent(query)}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.success && result.data.length > 0) {
                this.displaySearchResults(result.data);
            } else {
                this.displayNoResults(query);
            }
        } catch (error) {
            console.error('Error en la búsqueda:', error);
        }
    }

    displaySearchResults(products) {
        const categoriesContainer = document.getElementById('categorias-container');
        // Filtrar categorías para mostrar solo las que tienen resultados
        const categoriesMap = new Map();
        
        //products.forEach(product => this.createProductItem(product)) 
        products.forEach(product => this.createProductItem(product)) 
    }

    createProductItem(producto){
        const hasStock = producto.stock > 0;
        if (!hasStock) {
            return; // No renderizar productos sin stock
        }else{
            let search=true;
            cargarDOMProductos(productosContainerSearch, producto, hasStock, search);  //funcion en main.js
        }
    }

    //ARREGLAR: EL PRODUCTO EN SEARCH SE AGREGA AL CARRITO PERO SE PIERDE SI SE REFRESH Y NO SE REPLICA EN EL PRODUCTO POR CATEGORIA

    displayNoResults(query) {
        const categoriesContainer = document.getElementById('categorias-container');
        categoriesContainer.innerHTML = `
            <div class="no-results">
                <p>🔍 No se encontraron productos para "${query}"</p>
                <p style="color: #999; font-size: 0.9rem;">Intenta con otras palabras</p>
            </div>
        `;
    }

    clearSearch() {
        document.getElementById('searchInput').value = '';
        document.getElementById('mobileSearchInput').value = '';
    }
}

// Inicializar búsqueda
const searchHandler = new SearchHandler();