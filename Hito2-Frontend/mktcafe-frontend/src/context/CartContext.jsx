import { createContext, useContext, useState, useReducer, useEffect } from 'react'

// Creación del contexto del carrito
export const CartContext = createContext()

// Hook personalizado para consumir el contexto del carrito
export const useCart = () => useContext(CartContext)

const CART_STORAGE_KEY = 'mktcafe_cart'

const loadCartFromStorage = () => {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

// Reducer para manejar las acciones del carrito
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const exists = state.items.find(i => i.id === action.payload.id)
      if (exists) {
        return {
          ...state,
          items: state.items.map(i =>
            i.id === action.payload.id
              ? { ...i, cantidad: i.cantidad + 1 }
              : i
          ),
        }
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, cantidad: 1 }],
      }
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(i => i.id !== action.payload),
      }
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(i =>
          i.id === action.payload.id
            ? { ...i, cantidad: action.payload.cantidad }
            : i
        ),
      }
    case 'CLEAR_CART':
      return { ...state, items: [] }
    default:
      return state
  }
}

const initialState = { items: loadCartFromStorage() }

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  // Persistir carrito en localStorage cuando cambian los items
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items))
  }, [state.items])

  const addItem = (product) => dispatch({ type: 'ADD_ITEM', payload: product })
  const removeItem = (id) => dispatch({ type: 'REMOVE_ITEM', payload: id })
  const updateQuantity = (id, cantidad) =>
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, cantidad } })
  const clearCart = () => dispatch({ type: 'CLEAR_CART' })

  // Total de items en el carrito
  const totalItems = state.items.reduce((acc, i) => acc + i.cantidad, 0)

  // Total de precio
  const totalPrice = state.items.reduce(
    (acc, i) => acc + i.precio * i.cantidad,
    0
  )

  const value = {
    items: state.items,
    totalItems,
    totalPrice,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
