import { Component } from '@angular/core';
import { Injectable } from "@angular/core";
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Http, Headers } from '@angular/http';
import * as Enums from '../../assets/apiconfig';
import { IdeasInputPage } from '../ideas-input/ideas-input';


/**
 * Generated class for the IdeasProjectsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-ideas-projects',
  templateUrl: 'ideas-projects.html'
})

@Injectable()
export class IdeasProjectsPage {

  //data to be extracted or pushed onto the server
  ideas=[];
  subject: string;
  user_id: string;

  //serchbar query
  query: string;
  dataReceived: any;

  //default viewmode is latest.
  viewMode: string;

  constructor(public navCtrl: NavController, public navParams: NavParams, public http: Http){
    this.ideas = [];

    this.viewMode = "Latest";
    //prev params
    this.user_id = this.navParams.get('userid');
    this.subject = this.navParams.get('subject');

    let url = Enums.APIURL.URL1;

    //default view is latest ideas
    let path = url.concat("/ideas/latest/",this.subject);


    console.log(this.user_id);
    console.log(this.subject);

    this.http.get(path).subscribe(res => {
      this.dataReceived = res.json();
      console.log(this.dataReceived);
    }, (err) => {
        console.log(err);
    });
    this.ideas = this.dataReceived

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad IdeasProjectsPage');
  }

  postNew(){
    this.navCtrl.push(IdeasInputPage,{userid: this.user_id})
  }
}
