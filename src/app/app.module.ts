import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {A11yModule} from '@angular/cdk/a11y';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {PortalModule} from '@angular/cdk/portal';
import {ScrollingModule, ScrollDispatchModule} from '@angular/cdk/scrolling';
import {CdkStepperModule} from '@angular/cdk/stepper';
import {CdkTableModule} from '@angular/cdk/table';
import {CdkTreeModule} from '@angular/cdk/tree';

import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import {MatMenuModule} from '@angular/material/menu';
import {MatDividerModule} from '@angular/material/divider';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatBadgeModule} from '@angular/material/badge';
import {MatBottomSheetModule} from '@angular/material/bottom-sheet';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatChipsModule} from '@angular/material/chips';
import {MatStepperModule} from '@angular/material/stepper';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatDialogModule} from '@angular/material/dialog';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {MatNativeDateModule, MatRippleModule} from '@angular/material/core';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatRadioModule} from '@angular/material/radio';
import {MatSelectModule} from '@angular/material/select';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatSliderModule} from '@angular/material/slider';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatSortModule} from '@angular/material/sort';
import {MatTableModule} from '@angular/material/table';
import {MatTabsModule} from '@angular/material/tabs';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatTreeModule} from '@angular/material/tree';


import { LoginComponent } from './user/login/login.component';
import { RegistrationComponent } from './user/registration/registration.component';
import { VisitorsComponent } from './db/visitors/visitors.component';
import { InviteComponent } from './invite/invite.component';
import { AuthComponent } from './auth/auth.component';

import { NgxBarcodeModule } from 'ngx-barcode';
import { VisitorComponent } from './db/visitors/visitor/visitor.component';
import { StartComponent } from './start/start.component';
import { DashboardComponent } from './db/dashboard/dashboard.component';
import { DbComponent } from './db/db.component';
import { PlahtyComponent } from './db/plahty/plahty.component';
import { CompaniesComponent } from './db/companies/companies.component';
import { VisexhibsComponent } from './db/visexhibs/visexhibs.component';
import { VisexhibComponent } from './db/visexhib/visexhib.component';
import { TranslatePipe } from './translate.pipe';

import { RecaptchaModule, RecaptchaFormsModule } from 'ng-recaptcha';

import { html2pdf } from 'html2pdf.js';
import { EmailComponent } from './db/mail/email/email.component';
import { MailComponent } from './db/mail/mail.component';
import { MailinglistComponent } from './db/mail/mailinglist/mailinglist.component';
import { MessageslistComponent } from './db/mail/messageslist/messageslist.component';
import { EmaillistComponent, DialogMailingProperty} from './db/mail/emaillist/emaillist.component';



@NgModule({
  entryComponents: [EmaillistComponent, DialogMailingProperty],
  declarations: [
    AppComponent,
    LoginComponent,
    RegistrationComponent,
    VisitorsComponent,
    InviteComponent,
    VisitorComponent,
    AuthComponent,
    StartComponent,
    DashboardComponent,
    DbComponent,
    PlahtyComponent,
    CompaniesComponent,
    VisexhibsComponent,
    VisexhibComponent,
    TranslatePipe,
    EmailComponent,
    MailComponent,
    MailinglistComponent,
    MessageslistComponent,
    EmaillistComponent,
    DialogMailingProperty
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatMenuModule,
    MatDividerModule,
    A11yModule,
    CdkStepperModule,
    CdkTableModule,
    CdkTreeModule,
    DragDropModule,
    MatAutocompleteModule,
    MatBadgeModule,
    MatBottomSheetModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatStepperModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatTreeModule,
    PortalModule,
    ScrollingModule,
    ScrollDispatchModule,
    FormsModule,
    HttpClientModule,
    NgxBarcodeModule,
    RecaptchaModule,
    RecaptchaFormsModule,
    //html2pdf
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }  
