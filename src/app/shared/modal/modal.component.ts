import { Component, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { NgbModalConfig, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { GenericService } from 'src/app/services/generic.service';
import { MachineService } from 'src/app/services/machine.service';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  standalone: false
})
export class ModalComponent implements OnDestroy {
  /**
    * Subscribe to modal status
    */
  modalSubbscription: Subscription;

  @ViewChild('content') contentTemplateRef!: TemplateRef<any>;

  private modalRef: NgbModalRef | null = null;

  private closeTimeout: any = null;

  constructor(
    config: NgbModalConfig,
    private modalService: NgbModal,
    private gnrcSrv: GenericService
  ) {
    // customize default values of modals used by this component tree
    config.backdrop = 'static';
    config.keyboard = false;

    /** Subscribe to modal status */
    this.modalSubbscription = this.gnrcSrv.getModalStatus().subscribe((data) => {
      console.log(data)
      if (data.openModal) {
        this.isSuccess = data.success
        this.msgCode = data.msgCode
        this.open()
        setTimeout(() => {
          this.close()
        }, 4000);
      }
    });

  }

  open() {
    this.modalRef = this.modalService.open(this.contentTemplateRef, {
      centered: false,
      backdrop: false,
      windowClass: 'toaster-modal'
    })
  }

  close() {
    if (this.modalRef) {
      this.modalRef.close();
      this.modalRef = null;
    }
  }


  /**
   * Unsubscribe to login on component destroy
   */
  ngOnDestroy() {
    this.modalSubbscription.unsubscribe();
  }
  
}
