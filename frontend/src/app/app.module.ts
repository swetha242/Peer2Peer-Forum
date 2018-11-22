import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';


import { HttpModule } from '@angular/http';
import { IonicStorageModule } from '@ionic/storage'
import { HttpClientModule } from '@angular/common/http';

import { HelloIonicPage } from '../pages/hello-ionic/hello-ionic';
import { ItemDetailsPage } from '../pages/item-details/item-details';
import { ListPage } from '../pages/list/list';
import { LoginPage } from '../pages/login/login'
import { SignupPage} from '../pages/signup/signup';
import { SubjectsPage} from '../pages/subjects/subjects';
import { ProfilePage } from '../pages/profile/profile';
import { NotesPage } from '../pages/notes/notes';
import {ViewnotesPage} from '../pages/viewnotes/viewnotes';
import {LaunchPage} from '../pages/launch/launch';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AuthProvider } from '../providers/auth/auth';
import { PdfViewerComponent } from 'ng2-pdf-viewer';
import { IdeasProjectsPage } from '../pages/ideas-projects/ideas-projects';
import { IdeasInputPage } from '../pages/ideas-input/ideas-input';
import { File } from '@ionic-native/file';
import { FileTransfer } from '@ionic-native/file-transfer';
import { DocumentViewer } from '@ionic-native/document-viewer';
import {NotifPage} from '../pages/notif/notif';
import { RecoQuestionsPage} from '../pages/reco-questions/reco-questions';
import { RecoNotesPage} from '../pages/reco-notes/reco-notes';
import { IdeasDetailsPage } from '../pages/ideas-details/ideas-details';


@NgModule({
  declarations: [
    MyApp,
    HelloIonicPage,
    ItemDetailsPage,
    ListPage,
    LoginPage,
    SignupPage,
    SubjectsPage,
    ProfilePage,
    NotesPage,
    ViewnotesPage,
    PdfViewerComponent,
    LaunchPage,
    RecoQuestionsPage,
    RecoNotesPage,
    IdeasProjectsPage,
    IdeasInputPage,
    NotifPage,
    IdeasDetailsPage
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    HttpModule,
    IonicStorageModule.forRoot(),
    IonicModule.forRoot(MyApp),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HelloIonicPage,
    ItemDetailsPage,
    ListPage,
    LoginPage,
    SignupPage,
    SubjectsPage,
    ProfilePage,
    NotesPage,
    ViewnotesPage,
    LaunchPage,
    RecoQuestionsPage,
    RecoNotesPage,
    IdeasProjectsPage,
   IdeasInputPage,
   NotifPage,
   IdeasDetailsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    AuthProvider,
    File,
    FileTransfer,
    DocumentViewer
  ]
})
export class AppModule {


}
