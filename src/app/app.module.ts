import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { HeaderComponent } from './header/header.component';
import { LoaderComponent } from './loader/loader.component';
import { LoaderInterceptor } from './loader-inerceptor';
import { ApitestingComponent } from './apitesting/apitesting.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@NgModule({
    declarations: [
        AppComponent,
        LoginComponent,
        HeaderComponent,
        LoaderComponent,
        ApitestingComponent
    ],
    bootstrap: [AppComponent], imports: [BrowserModule,
        AppRoutingModule,
        CommonModule,
        ReactiveFormsModule,
        FormsModule], providers: [
            { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true },
            provideHttpClient(withInterceptorsFromDi())
        ]
})
export class AppModule { }
