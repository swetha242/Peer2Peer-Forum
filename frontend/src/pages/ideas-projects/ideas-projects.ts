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
  mode: any;

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
    this.mode = this.navParams.get('mode');
    let url = Enums.APIURL.URL1;

    //default view is latest ideas
    let path = url.concat("/ideas/latest/",this.subject);

    console.log(this.subject);

    this.http.get(path).subscribe(res => {
      console.log(res);
      let dataReceived = res.json()['ideas'];
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
    }

  );
  if(this.mode == "reco"){
    this.initRecommended();
  }

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
      var val = ev.target.value
      if (val && val.trim() != '') {
        this.ideas = this.ideas.filter(idea => {

          return (idea.description.toLowerCase().indexOf(val.toLowerCase()) > -1);
        })
      }
    }, (err) => {
        console.log(err);
    });
    console.log(this.ideas);
  }

  ideaLatest(){
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

  initRecommended(){
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let url = Enums.APIURL.URL1;
    let path = url.concat( "/ideas/recoideas/");
    let postParams = {asked_by: this.user_id}
    this.http.post(path, postParams, {headers: headers})
     .subscribe(res => {
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
    });
  }

  ideaTapped(event,idea){
    let url = Enums.APIURL.URL1;
    let path = url.concat("/ideas/incr/")
    let postParams = {idea_id: idea['_id']}
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    console.log("HEREEEEEEEEEEEEEEEEEEEEEEEEE")
    this.http.post(path,postParams,{headers: headers}).subscribe(res => {
      console.log(res);});
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
