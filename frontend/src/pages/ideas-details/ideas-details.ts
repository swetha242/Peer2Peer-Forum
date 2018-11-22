import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Http, Headers } from '@angular/http';
import { Storage } from '@ionic/storage';
import * as Enums from '../../assets/apiconfig';
import { ProfilePage } from '../profile/profile';
/**
 * Generated class for the IdeasDetailsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-ideas-details',
  templateUrl: 'ideas-details.html',
})
export class IdeasDetailsPage {
  selectedIdea: any;
  requests: any;
  show: any;
  requests_check: any;
  userid: any;
  new_comment:any;
  count:any;
  constructor(public navCtrl: NavController, public navParams: NavParams, public http: Http, public storage: Storage) {
    this.selectedIdea = this.navParams.get('idea');
    this.requests = this.navParams.get('request');
    this.requests_check = 0;
    this.show = 1;
    this.storage.get('userid').then((uid)=>{
      this.userid = uid;
      console.log(this.userid);
    });
    console.log(this.userid)
    console.log(this.selectedIdea.owner_id)
    if(this.userid == this.selectedIdea.owner_id){
      console.log("NOOOB")
      this.show = 0;
    }
    let url = Enums.APIURL.URL1;
    let path = url.concat("/ideas/count_colaborator/");
    let postParams = {idea_id: this.selectedIdea['_id']}
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.http.post(path,postParams,{headers:headers}).subscribe(res => {this.count = res['count'];});
    if(this.selectedIdea.max_colaborators > this.count){
      this.show = 0;
    }
    if(this.requests == null){
      this.requests_check = 1;
    }
    this.ideaInitialize();
  }
  ideaInitialize(){
    let url = Enums.APIURL.URL1;
    let path = url.concat("/idea/get/");
    let postParams = {idea_id: this.selectedIdea['_id']}
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.http.post(path,postParams,{headers: headers}).subscribe(res => {
      console.log(res);
      let dataReceived = res.json()['idea'];

        this.selectedIdea = {
          _id: dataReceived._id,
          title: dataReceived.title,
          links: dataReceived.links,
          subject: dataReceived.subject,
          time: dataReceived.time,
          tags: dataReceived.tags,
          summary: dataReceived.summary,
          description: dataReceived.description,
          max_colaborators: dataReceived.max_colaborators,
          owner_id: dataReceived.owner_id,
          upvotes: dataReceived.upvotes,
          downvotes: dataReceived.downvotes,
          views: dataReceived.views,
          colaborator_id: dataReceived.colaborator_id,
          mentor_id: dataReceived.mentor_id,
          mentor_status: dataReceived.mentor_status,
          comments: dataReceived.comments,
          owner: dataReceived.owner_name,
          mentor: dataReceived.mentor_name,
          colab_emails: dataReceived.colab_emails
        }
    }, (err) => {
        console.log(err);
    });
  }

  upvoteIdea(){
    let url = Enums.APIURL.URL1;
    let path = url.concat("/ideas/upvote/")
    let postParams = {idea_id: this.selectedIdea['_id']}
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.http.post(path,postParams,{headers: headers}).subscribe(res => {
     console.log(res)
   });
    console.log("HERE!!!!!!!!!")
    this.ideaInitialize();
  }

  downvoteIdea(){

      let url = Enums.APIURL.URL1;
      let path = url.concat("/ideas/downvote/")
      let postParams = {idea_id: this.selectedIdea['_id']}
      let headers = new Headers();
      headers.append('Content-Type', 'application/json');
      this.http.post(path,postParams,{headers: headers}).subscribe(res => {
       console.log(res)
     });
     console.log("HERE!!!!")
      this.ideaInitialize();
  }
  request_colab(){

  }

  profile(id){
    this.navCtrl.push(ProfilePage,{userid:this.userid})
  }
  accept(request,i){
    let url = Enums.APIURL.URL1;
    let path = url.concat("/ideas/update_members/")
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let postParams = {ideas_id: this.selectedIdea['_id'],member_id:request['user_id'],mode:request['mode']}
    this.http.post(path,postParams,{headers: headers})
    this.requests.splice(i,1)
  }
  reject(request,i){
    this.requests.splice(i,1)
  }
  discuss(){
    console.log("HERE");
    let url = Enums.APIURL.URL1;
    let path = url.concat("/ideas/insert_comment/")
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let postParams = {ideas_id: this.selectedIdea['_id'],user_id:this.userid,comments:this.new_comment}
    this.http.post(path,postParams,{headers: headers}).subscribe(res => {
     console.log(res)
   });
    console.log(this.new_comment)
    this.ideaInitialize()
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad IdeasDetailsPage');
  }

}
