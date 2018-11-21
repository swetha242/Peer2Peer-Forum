import { Component } from '@angular/core';
import { Injectable } from "@angular/core";
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Http, Headers } from '@angular/http';
import * as Enums from '../../assets/apiconfig';
import { IdeasInputPage } from '../ideas-input/ideas-input';
import { IdeasDetailsPage } from '../ideas-details/ideas-details';
import { Storage } from '@ionic/storage';

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

  //default viewmode is latest.
  viewMode: string;

  constructor(public navCtrl: NavController, public navParams: NavParams, public http: Http, public storage: Storage){
    this.ideas = [];
    this.storage.get('userid').then((uid)=>{
      this.user_id = uid
      console.log(this.user_id)
    })
    this.viewMode = "Latest";
    //prev params
    this.subject = this.navParams.get('subject');

    let url = Enums.APIURL.URL1;

    //default view is latest ideas
    let path = url.concat("/ideas/latest/",this.subject);

    console.log(this.subject);

    this.http.get(path).subscribe(res => {
      console.log(res);
      let dataReceived = res.json()['ideas'];
      for(let i in dataReceived){
        this.ideas.push({
          title: dataReceived[i].title,
          summary: dataReceived[i].summary,
          owner: dataReceived[i].owner_name,
          upvotes: dataReceived[i].upvotes,
          downvotes: dataReceived[i].downvotes,
          views: dataReceived[i].views,
          mentor: dataReceived[i].mentor_name
        })
      }
    }, (err) => {
        console.log(err);
    }

  );

  }

  ideaInitialize(ev){
    this.subject = this.navParams.get('subject');

    let url = Enums.APIURL.URL1;

    //default view is latest ideas
    let path = url.concat("/ideas/latest/Any");

    console.log(this.subject);

    this.http.get(path).subscribe(res => {
      console.log(res);
      let dataReceived = res.json()['ideas'];
      this.ideas = []
      for(let i in dataReceived){
        this.ideas.push({
          _id: dataReceived[i]._id,
          title: dataReceived[i].title,
          links: dataReceived[i].links,
          subject: dataReceived[i].subject,
          time: dataReceived[i].time,
          tags: dataReceived[i].tags,
          summary: dataReceived[i].summary,
          description: dataReceived[i].description,
          max_colaborators: dataReceived[i].max_colaborators,
          owner_id: dataReceived[i].owner_id,
          upvotes: dataReceived[i].upvotes,
          downvotes: dataReceived[i].downvotes,
          views: dataReceived[i].views,
          colaborator_id: dataReceived[i].colaborator_id,
          mentor_id: dataReceived[i].mentor_id,
          mentor_status: dataReceived[i].mentor_status,
          comments: dataReceived[i].comments,
          owner: dataReceived[i].owner_name,
          mentor: dataReceived[i].mentor_name,
          colab_emails: dataReceived[i].colab_emails
        })
      }
    }, (err) => {
        console.log(err);
    });
    console.log(this.ideas);
  }

  ideaTapped(event,idea){
    this.navCtrl.push(IdeasDetailsPage,{idea:idea})
  }

  getIdeas(ev: any){
    this.ideaInitialize(ev);
  }

  onCancel(ev){
    console.log('pressed cancel')
    return 0;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad IdeasProjectsPage');
  }

  postNew(){
    this.navCtrl.push(IdeasInputPage)
  }
}
