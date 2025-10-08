import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';

import { NgbDropdownModule, NgbModal, NgbModalConfig, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoaderInterceptor } from '../loader-inerceptor';
import { HeaderComponent } from './header/header.component';
import { LoaderComponent } from './loader/loader.component';
import { LoginComponent } from './login/login.component';
import { RouterModule } from '@angular/router';
import { BannerComponent } from './banner/banner.component';
import { NavComponent } from './nav/nav.component';
import { DatepickerComponent } from './datepicker/datepicker.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { NotificationsPopupComponent } from './notifications-popup/notifications-popup.component';
import { TranslateModule } from '@ngx-translate/core';
import { PrintComponent } from './print/print.component';
import { ModalComponent } from './modal/modal.component';


// Custom date formats
export const MY_FORMATS = {
  parse: {
    dateInput: 'DD-MM-YYYY', // For parsing input from the datepicker
  },
  display: {
    dateInput: 'DD-MM-YYYY', // For displaying date in the input field
    monthYearLabel: 'MMM YYYY', // For month-year view
    dateA11yLabel: 'LL', // Accessibility label
    monthDayA11yLabel: 'DD MMMM', // Accessibility label for month-day
  },
};

@NgModule({
  declarations: [
    HeaderComponent,
    LoaderComponent,
    LoginComponent,
    BannerComponent,
    NavComponent,
    DatepickerComponent,
    NotificationsPopupComponent,
    PrintComponent,
    ModalComponent
  ],
  exports: [
    HeaderComponent,
    LoaderComponent,
    LoginComponent,
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    NgbDropdownModule,
    BannerComponent,
    NavComponent,
    DatepickerComponent,
    NotificationsPopupComponent,
    TranslateModule,
    PrintComponent,
    ModalComponent,
    NgbPaginationModule
  ],
  imports: [CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgbDropdownModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    TranslateModule,
    NgbPaginationModule
  ],
  providers: [
    NgbModalConfig, NgbModal,
    DecimalPipe,
    { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true },
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    provideHttpClient(withInterceptorsFromDi()),
  ]
})
export class SharedModule { }
