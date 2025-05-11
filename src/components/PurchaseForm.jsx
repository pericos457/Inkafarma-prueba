import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './PurchaseForm.css';

const initialProductItem = { productId: '', quantity: 1, price: 0, name: '' };

export default function PurchaseForm() {
    const navigate = useNavigate();
    const [clientDni, setClientDni] = useState('');
    const [foundClient, setFoundClient] = useState(null);
    const [clientSearchMessage, setClientSearchMessage] = useState('');
    const [isClientLoading, setIsClientLoading] = useState(false);

    const [allProducts, setAllProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([{ ...initialProductItem, uniqueId: Date.now() }]); // Añadir ID único para key
    const [totalAmount, setTotalAmount] = useState(0);

    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({});

    // Mostrar/ocultar modal
    const [isModalOpen, setIsModalOpen] = useState(true);

    const closeModal = () => {
        setIsModalOpen(false);
        navigate('/');
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const { data } = await api.get('/productos');
                setAllProducts(data);
            } catch (error) {
                console.error("Error fetching products:", error);
                setMessage('Error al cargar la lista de productos.');
            }
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        let total = 0;
        selectedProducts.forEach((item) => {
            if (item.productId && item.quantity > 0) {
                if (typeof item.price === 'number') {
                     const subtotal = item.price * item.quantity;
                     total += subtotal;
                }
            }
        });
        setTotalAmount(total);
    }, [selectedProducts]);

    const handleClientSearch = async () => {
        if (!/^\d{8}$/.test(clientDni)) {
            setClientSearchMessage('Ingrese un DNI válido de 8 dígitos.');
            setFoundClient(null);
            return;
        }
        setIsClientLoading(true);
        setClientSearchMessage('Buscando...');
        setFoundClient(null);
        try {
            const response = await api.get(`/clientes?dni=${clientDni}`);

            if (response.data && response.data.length > 0) {
                setFoundClient(response.data[0]);
                setClientSearchMessage(`Cliente encontrado: ${response.data[0].nombre} ${response.data[0].apellido_pat}`);
                setErrors(prev => ({ ...prev, client: null }));
            } else {
                setClientSearchMessage('Cliente no encontrado. Verifique el DNI o regístrelo.');
                setFoundClient(null);
            }
        } catch (error) {
            console.error("Error searching client:", error);
            setClientSearchMessage('Error al buscar el cliente.');
            setFoundClient(null);
        } finally {
            setIsClientLoading(false);
        }
    };

    const handleAddProduct = () => {
        setSelectedProducts(prev => [...prev, { ...initialProductItem, uniqueId: Date.now() }]);
    };

    const handleRemoveProduct = (uniqueIdToRemove) => {
        setSelectedProducts(prev => prev.filter(item => item.uniqueId !== uniqueIdToRemove));
    };

    const handleProductChange = (uniqueId, selectedProductId) => {
        const product = allProducts.find(p => p.id === parseInt(selectedProductId, 10));

        const rawPrice = product ? product.precio : undefined;
        const price = product ? parseFloat(rawPrice) : 0;

        const validPrice = !isNaN(price) ? price : 0;

        setSelectedProducts(prev =>
            prev.map(item =>
                item.uniqueId === uniqueId
                    ? { ...item, productId: selectedProductId, price: validPrice, name: product?.nombre || '' }
                    : item
            )
        );
    };
    const handleQuantityChange = (uniqueId, quantity) => {
        const numQuantity = parseInt(quantity, 10);
        setSelectedProducts(prev =>
            prev.map(item =>
                item.uniqueId === uniqueId
                    ? { ...item, quantity: numQuantity >= 1 ? numQuantity : 1 }
                    : item
            )
        );
    };

    const validateForm = () => {
        const newErrors = {};
        if (!foundClient) {
            newErrors.client = 'Debe seleccionar un cliente válido.';
        }
        const validProducts = selectedProducts.filter(p => p.productId && p.quantity > 0);
        if (validProducts.length === 0) {
            newErrors.products = 'Debe añadir al menos un producto válido.';
        } else {
            const productIds = validProducts.map(p => p.productId);
            if (new Set(productIds).size !== productIds.length) {
                newErrors.products = 'No puede seleccionar el mismo producto más de una vez.';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        const dataToSend = {
            cliente_id: foundClient.id,
            productos: selectedProducts
                .filter(p => p.productId && p.quantity > 0)
                .map(p => ({
                    producto_id: p.productId,
                    cantidad: p.quantity
                })),
        };

        try {
            await api.post('/compras', dataToSend);
            setMessage('Compra registrada con éxito!');
            setErrors({});
            setClientDni('');
            setFoundClient(null);
            setClientSearchMessage('');
            setSelectedProducts([{ ...initialProductItem, uniqueId: Date.now() }]);
            setTimeout(() => {
                setMessage('');
            }, 3000);

        } catch (error) {
            console.error("Error creating purchase:", error.response?.data || error.message);
            setMessage(`Error al registrar la compra: ${error.response?.data?.message || error.message}`);
            setErrors({});
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {isModalOpen && (
                <div className="purchase-form-overlay" onClick={closeModal}>
                    <div className="purchase-form-container" onClick={(e) => e.stopPropagation()}>
                        <h2>Registrar Nueva Compra</h2>
                        {message && <p className={`form-message ${message.toLowerCase().includes('error') ? 'error' : 'success'}`}>{message}</p>}

                        <form onSubmit={handleSubmit} noValidate>
                            <fieldset className="form-section">
                                <legend>Cliente</legend>
                                <div className={`form-group inline-group ${errors.client ? 'error' : ''}`}>
                                    <label htmlFor="clientDni">DNI Cliente:</label>
                                    <input
                                        type="text"
                                        id="clientDni"
                                        value={clientDni}
                                        onChange={(e) => setClientDni(e.target.value)}
                                        maxLength="8"
                                        disabled={isClientLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleClientSearch}
                                        disabled={isClientLoading || clientDni.length !== 8}
                                        className="search-btn"
                                    >
                                        {isClientLoading ? 'Buscando...' : 'Buscar'}
                                    </button>
                                </div>
                                {clientSearchMessage && <p className={`client-search-message ${foundClient ? 'found' : 'not-found'}`}>{clientSearchMessage}</p>}
                                {errors.client && <span className="error-message">{errors.client}</span>}
                            </fieldset>

                            <fieldset className="form-section">
                                <legend>Productos</legend>
                                {errors.products && <span className="error-message error-block">{errors.products}</span>}
                                {selectedProducts.map((item, index) => (
                                    <div key={item.uniqueId} className="product-item">
                                        <div className="form-group product-select-group">
                                            <label htmlFor={`product-${item.uniqueId}`}>Producto:</label>
                                            <select
                                                id={`product-${item.uniqueId}`}
                                                value={item.productId}
                                                onChange={(e) => handleProductChange(item.uniqueId, e.target.value)}
                                                required
                                            >
                                                <option value="">-- Seleccione --</option>
                                                {allProducts.map(p => {
                                                    const price = parseFloat(p.precio);
                                                    const displayPrice = !isNaN(price) ? price.toFixed(2) : 'N/A';
                                                    return (
                                                        <option key={p.id} value={p.id}>
                                                            {p.nombre} (S/ {displayPrice})
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                        </div>
                                        <div className="form-group product-quantity-group">
                                            <label htmlFor={`quantity-${item.uniqueId}`}>Cantidad:</label>
                                            <input
                                                type="number"
                                                id={`quantity-${item.uniqueId}`}
                                                value={item.quantity}
                                                onChange={(e) => handleQuantityChange(item.uniqueId, e.target.value)}
                                                min="1"
                                                step="1"
                                                required
                                                disabled={!item.productId}
                                            />
                                        </div>
                                        <div className="product-price-display">
                                            Subtotal: S/ {(item.price * item.quantity).toFixed(2)}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveProduct(item.uniqueId)}
                                            className="remove-product-btn"
                                            disabled={selectedProducts.length <= 1}
                                        >
                                            &times;
                                        </button>
                                    </div>
                                ))}
                                <button type="button" onClick={handleAddProduct} className="add-product-btn">
                                    + Añadir Producto
                                </button>
                            </fieldset>

                            <div className="total-section">
                                <h3>Total Compra: S/ {totalAmount.toFixed(2)}</h3>
                            </div>

                            <div className="button-group">
                                <button type="submit" disabled={isLoading || !foundClient || selectedProducts.every(p => !p.productId)}>
                                    {isLoading ? 'Registrando...' : 'Registrar Compra'}
                                </button>
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={closeModal}
                                    disabled={isLoading}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
