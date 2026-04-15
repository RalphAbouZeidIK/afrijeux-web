import { Component, Input, OnInit } from '@angular/core';
import { CartService } from '../../../../services/cart.service';

export interface Product {
  id: string | number;
  title: string;
  price: number;
  image: string;
  description?: string;
}

@Component({
  selector: 'app-bp-product-list',
  standalone: false,
  templateUrl: './bp-product-list.component.html',
  styleUrls: ['./bp-product-list.component.scss']
})
export class BpProductListComponent implements OnInit {
  @Input() products: Product[] = [];

  productQuantities: { [key: string | number]: number } = {};
  cartOpen = false;
  cartItems: Array<{ product: Product; quantity: number }> = [];

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    // Initialize quantities for all products
    this.products.forEach(product => {
      this.productQuantities[product.id] = 1;
    });
  }

  get totalItems(): number {
    return this.cartItems.reduce((count, item) => count + item.quantity, 0);
  }

  get cartTotal(): number {
    return this.cartItems.reduce((sum, item) => sum + item.quantity * item.product.price, 0);
  }

  toggleCart(): void {
    this.cartOpen = !this.cartOpen;
  }

  removeFromCart(productId: string | number): void {
    this.cartItems = this.cartItems.filter(item => item.product.id !== productId);
  }

  /**
   * Increase product quantity
   */
  increaseQuantity(productId: string | number): void {
    this.productQuantities[productId] = (this.productQuantities[productId] || 0) + 1;
  }

  /**
   * Decrease product quantity (min 1)
   */
  decreaseQuantity(productId: string | number): void {
    if (this.productQuantities[productId] > 1) {
      this.productQuantities[productId]--;
    }
  }

  /**
   * Add product to cart
   */
  addToCart(product: Product): void {
    const quantity = this.productQuantities[product.id] || 1;
    const existingItem = this.cartItems.find(item => item.product.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.cartItems.push({ product, quantity });
    }

    const cartItem = {
      productId: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      quantity: quantity,
      timestamp: new Date()
    };

    // Using cart service to add item
    this.cartService.setPmuBets(cartItem);

    // Reset quantity to 1 after adding
    this.productQuantities[product.id] = 1;

    // Show visual feedback (optional)
    console.log(`Added ${quantity}x ${product.title} to cart`);
  }
}
