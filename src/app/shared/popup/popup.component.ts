import { NgIf } from '@angular/common';
import { Component, Input, OnChanges, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal, NgbModalConfig, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-popup',
  standalone: true,
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss']
})
export class PopupComponent implements OnChanges {
  @Input() title = 'Default Title';
  @Input() isModalOpen = false;
  @Input() description = 'Default Description';
  @ViewChild('content') popupTemplate!: TemplateRef<any>;
  private modalRef?: NgbModalRef;

  constructor(
    config: NgbModalConfig,
    private modalService: NgbModal
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
  }

  ngOnChanges() {
    if (this.isModalOpen) {
      this.open();
    } else {
      this.close();
    }
  }

  open() {
    this.modalRef = this.modalService.open(this.popupTemplate, { centered: true })
  }

  close() {
    this.isModalOpen = false;
    this.modalRef?.close();
  }

  dismiss() {
    this.modalRef?.dismiss();
  }
}
