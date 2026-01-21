import { useCart } from "../context/CartContext";

export default function CartItem({ item }) {
  const { dispatch } = useCart();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between border border-white/10 rounded-2xl p-6 shadow-2xl bg-white/5 backdrop-blur-md mb-4 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500">
      {/* Product Info */}
      <div className="flex items-center space-x-6 mb-4 sm:mb-0">
        <img
          src={item.image}
          alt={item.name}
          className="w-28 h-28 object-cover rounded-xl border border-white/20 shadow-lg"
        />
        <div>
          <h3 className="font-bold text-white text-xl mb-1">{item.name}</h3>
          <p className="text-white/70 text-lg">${item.price}</p>
          <p className="text-white/60 mt-1">Quantity: {item.quantity}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        {/* Remove one */}
        <button
          className="px-5 py-2.5 font-bold rounded-lg text-white bg-white/10 border border-white/20 hover:bg-white/20 hover:scale-105 transition-all duration-300 shadow-lg"
          onClick={() =>
            dispatch({ type: "DECREMENT_ITEM", payload: { id: item.id } })
          }
        >
          -
        </button>

        {/* Add one */}
        <button
          className="px-5 py-2.5 font-bold rounded-lg text-white bg-white/10 border border-white/20 hover:bg-white/20 hover:scale-105 transition-all duration-300 shadow-lg"
          onClick={() => dispatch({ type: "ADD_ITEM", payload: item })}
        >
          +
        </button>

        {/* Remove all */}
        <button
          className="px-5 py-2.5 font-bold rounded-lg text-black bg-white hover:bg-white/90 hover:scale-105 transition-all duration-300 shadow-lg shadow-white/20"
          onClick={() =>
            dispatch({ type: "REMOVE_ITEM", payload: { id: item.id } })
          }
        >
          Remove
        </button>
      </div>
    </div>
  );
}
