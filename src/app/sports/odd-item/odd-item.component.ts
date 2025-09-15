import { Component, Input } from '@angular/core';
import { CartService } from 'src/app/services/cart.service';

@Component({
  selector: 'app-odd-item',
  templateUrl: './odd-item.component.html',
  styleUrls: ['./odd-item.component.scss'],
  standalone:false
})
export class OddItemComponent {
  @Input() oddItem: any

  @Input() isSelected = false

  constructor(private cartSrv: CartService) {

  }

  addOdd(oddItem: any) {
    oddItem.outcomeName = oddItem.outcome
    this.cartSrv.setSBBets(oddItem)
  }
}
