import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';

export interface OptionListItem {
  TicketTypeName: string;
  TicketTypeId: string | number;
  route?: string;
  queryParams?: { [key: string]: any };
  disabled?: boolean;
}

@Component({
  selector: 'app-option-list',
  standalone: false,
  templateUrl: './option-list.component.html',
  styleUrls: ['./option-list.component.scss']
})
export class OptionListComponent implements OnChanges {
  @Input() options: OptionListItem[] = [];
  @Input() selectedValue: string | number | null = null;
  @Input() navigateOnSelect = false;

  @Output() optionChange = new EventEmitter<OptionListItem>();

  constructor(private router: Router) { }

  ngOnChanges(changes: SimpleChanges): void {
    //console.log('OptionListComponent changes:', changes);
    if ((changes['options'] || changes['selectedValue']) && this.selectedValue == null && this.options.length > 0) {
      this.selectedValue = this.options[0].TicketTypeId;
    }
  }

  async onOptionClick(option: OptionListItem): Promise<void> {
    if (option.disabled) {
      return;
    }

    this.selectedValue = option.TicketTypeId;
    this.optionChange.emit(option);

    if (this.navigateOnSelect && option.route) {
      await this.router.navigate([option.route], {
        queryParams: option.queryParams || {}
      });
    }
  }

  isSelected(option: OptionListItem): boolean {
    return this.selectedValue === option.TicketTypeId;
  }
}
