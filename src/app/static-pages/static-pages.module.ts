import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { routing } from './static-pages-routing';



@NgModule({
  declarations: [],
  imports: [
    routing,
    CommonModule,
    SharedModule
  ]
})
export class StaticPagesModule { }
