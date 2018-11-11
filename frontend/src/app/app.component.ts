import { Component, ViewChild } from '@angular/core';

import { Platform, MenuController, Nav } from 'ionic-angular';

import { HelloIonicPage } from '../pages/hello-ionic/hello-ionic';
import { ListPage } from '../pages/list/list';
import {LoginPage} from '../pages/login/login'
import { SignupPage} from '../pages/signup/signup';
import { SubjectsPage} from '../pages/subjects/subjects';
import { ProfilePage } from '../pages/profile/profile';
import { IdeasProjectsPage } from '../pages/ideas-projects/ideas-projects';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';


@Component({
  templateUrl: 'app.html'
})

export class MyApp {
  @ViewChild(Nav) nav: Nav;

  // make HelloIonicPage the root (or first) page
  rootPage = LoginPage;
  pages: Array<{title: string, component: any}>;

  constructor(
    public platform: Platform,
    public menu: MenuController,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen
  ) {
    this.initializeApp();

    // set our app's pages
    // these are used in app.html to set the side menu
    this.pages = [
      { title: 'Home Page', component: HelloIonicPage },
      { title: 'Questions Page', component: ListPage },
      { title : 'Projects and Ideas', component : IdeasProjectsPage},
      { title : 'Login', component : LoginPage},
      { title : 'Sign Up',component : SignupPage},
      { title : 'Subjects Page', component : SubjectsPage},
      { title : 'Profile Page', component : ProfilePage}

    ];
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  openPage(page) {
    // close the menu when clicking a link from the menu
    this.menu.close();
    // navigate to the new page if it is not the current page
    this.nav.setRoot(page.component);
  }
}
