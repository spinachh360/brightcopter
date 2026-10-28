import { Minus, Plus } from "lucide-react";

export function Quantity({
  quantity,
  decrease,
  increase,
}: {
  quantity: number;
  decrease: () => void;
  increase: () => void;
}) {
  return (
    <div className="quantity-control">
      <button
        aria-label="Decrease quantity"
        onClick={decrease}
        disabled={quantity <= 1}
      >
        <Minus size={14} />
      </button>
      <span aria-live="polite">{quantity}</span>
      <button
        aria-label="Increase quantity"
        onClick={increase}
        disabled={quantity >= 20}
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
