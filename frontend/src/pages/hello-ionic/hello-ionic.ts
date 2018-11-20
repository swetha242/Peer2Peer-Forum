import { Component } from '@angular/core';
import { NavController, AlertController, LoadingController, Loading, IonicPage, NavParams } from 'ionic-angular';
import { SignupPage } from '../signup/signup';
import { LoginPage } from '../login/login';
import { Slides } from 'ionic-angular';
import { ViewChild } from '@angular/core';
import { Http, Headers } from '@angular/http';
import * as Enums from '../../assets/apiconfig';
import { IdeasProjectsPage } from '../ideas-projects/ideas-projects';
import { ListPage } from '../list/list';
import { NotesPage } from '../notes/notes';
//import

@Component({
  selector: 'page-hello-ionic',
  templateUrl: 'hello-ionic.html'
})
export class HelloIonicPage {

  /*user_id: any;

  path_QA = ListPage;
  path_Ideas = IdeasProjectsPage;
  path_Notes = NotesPage;*/
  constructor(public navCtrl: NavController, public navParams: NavParams,public http: Http,) {
    
    //this.user_id = this.navParams.get('userid');
    //console.log(this.user_id);
  }

  navigate(path){
    //this.navCtrl.push(path,{userid: this.user_id});
  }
 
  @ViewChild(Slides) slides: Slides;
    Login(){
      this.navCtrl.push(LoginPage);
    }
    Signup(){
      this.navCtrl.push(SignupPage);
    }
    goToSlide1() {
      this.slides.slideTo(0, 500);
    }

    goToSlide2() {
      this.slides.slideTo(1, 500);
    }

    goToSlide3() {
      this.slides.slideTo(2, 500);
    }
}
