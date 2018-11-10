import { Component } from '@angular/core';
import { NavController, AlertController, LoadingController, Loading, IonicPage } from 'ionic-angular';
import { SignupPage } from '../signup/signup';
import { LoginPage } from '../login/login';


@Component({
  selector: 'page-hello-ionic',
  templateUrl: 'hello-ionic.html'
})
export class HelloIonicPage {

  constructor(public navCtrl: NavController) {

  }

  Login(){
    this.navCtrl.push(LoginPage);
  }
  Signup(){
    this.navCtrl.push(SignupPage);
  }
}
