import { Component } from '@angular/core';
import { NavController, AlertController, LoadingController, Loading, IonicPage } from 'ionic-angular';
import { SignupPage } from '../signup/signup';
import { LoginPage } from '../login/login';

import { Http, Headers } from '@angular/http';
import { NavController, NavParams } from 'ionic-angular';
import * as Enums from '../../assets/apiconfig';
import { IdeasProjectsPage } from '../ideas-projects/ideas-projects';
import { ListPage } from '../list/list';
import { NotesPage } from '..notes/notes';
//import

@Component({
  selector: 'page-hello-ionic',
  templateUrl: 'hello-ionic.html'
})
export class HelloIonicPage {

  user_id: any;

  path_QA = ListPage;
  path_Ideas = IdeasProjectsPage;
  //path_Notes =
  constructor(public navCtrl: NavController, public navParams: NavParams,public http: Http) {
    this.user_id = this.navParams.get('userid');
    console.log(this.user_id);
  }

  navigate(path){
    this.navCtrl.push(path,{userid: this.user_id});
  }


    Login(){
      this.navCtrl.push(LoginPage);
    }
    Signup(){
      this.navCtrl.push(SignupPage);
    }
}
