import { createContext, useContext, useReducer } from "react";

// Create the Cart context
const CartContext = createContext();

// Custom hook to use cart anywhere
export const useCart = () => useContext(CartContext);

// Initial state
const initialState = {
  items: [],
};

// Sound effect for adding to cart
const playAddToCartSound = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    const playTone = (frequency, startTime, duration, volume = 0.3) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(volume, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };

    const now = audioContext.currentTime;
    
    // Pleasant "add to cart" sound - ascending notes
    playTone(500, now, 0.08, 0.25);
    playTone(700, now + 0.08, 0.12, 0.2);
  } catch (error) {
    // Silently fail if audio context isn't available
    console.log('Audio not available');
  }
};

// Reducer function
function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM": {
      // Play sound when item is added
      playAddToCartSound();
      
      const exists = state.items.find((i) => (i.id || i._id) === (action.payload.id || action.payload._id));
      if (exists) {
        return {
          ...state,
          items: state.items.map((i) =>
            (i.id || i._id) === (action.payload.id || action.payload._id)
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      } else {
        return {
          ...state,
          items: [...state.items, { ...action.payload, quantity: 1 }],
        };
      }
    }

    case "DECREMENT_ITEM": {
      return {
        ...state,
        items: state.items
          .map((i) =>
            (i.id || i._id) === (action.payload.id || action.payload._id)
              ? { ...i, quantity: i.quantity - 1 }
              : i
          )
          .filter((i) => i.quantity > 0), // Remove items with 0 quantity
      };
    }

    case "REMOVE_ITEM": {
      return {
        ...state,
        items: state.items.filter((i) => (i.id || i._id) !== (action.payload.id || action.payload._id)),
      };
    }

    case "CLEAR_CART": {
      return {
        ...state,
        items: [],
      };
    }

    default:
      return state;
  }
}

// Cart provider
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
};
