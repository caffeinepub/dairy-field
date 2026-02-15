import type { CartItemType } from '@/state/cart/cartTypes';
import type { Product } from '../backend';

export interface CartItemWithLatestPrice extends CartItemType {
  latestPrice: bigint | null;
  isMissing: boolean;
  lineTotal: number;
}

export interface CartPricingResult {
  items: CartItemWithLatestPrice[];
  total: number;
  hasMissingProducts: boolean;
}

export function calculateCartWithLatestPrices(
  cartItems: CartItemType[],
  products: Product[]
): CartPricingResult {
  const productMap = new Map(products.map(p => [p.name, p]));
  
  let total = 0;
  let hasMissingProducts = false;

  const items = cartItems.map(cartItem => {
    const product = productMap.get(cartItem.productName);
    
    if (!product) {
      hasMissingProducts = true;
      return {
        ...cartItem,
        latestPrice: null,
        isMissing: true,
        lineTotal: 0,
      };
    }

    const lineTotal = Number(product.price) * cartItem.quantity;
    total += lineTotal;

    return {
      ...cartItem,
      latestPrice: product.price,
      isMissing: false,
      lineTotal,
    };
  });

  return {
    items,
    total,
    hasMissingProducts,
  };
}
