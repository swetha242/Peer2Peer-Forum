import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Http, Headers } from '@angular/http';
import { Storage } from '@ionic/storage';
import * as Enums from '../../assets/apiconfig';
import { ProfilePage } from '../profile/profile';
/**
 * Generated class for the IdeasDetailsInteractPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-ideas-details-interact',
  templateUrl: 'ideas-details-interact.html',
})
export class IdeasDetailsInteractPage {
  selectedIdea: any;
  request: any;
  idea_id:any;
  show: any;
  request_check: any;
  userid: any;
  new_comment:any;
  count:any;
  constructor(public navCtrl: NavController, public navParams: NavParams, public http: Http, public storage: Storage) {
    this.idea_id = this.navParams.get('idea_id');
    this.selectedIdea.links = [];
    this.selectedIdea.colab_emails = [];
    
    let url = Enums.APIURL.URL1;
    let path = url.concat("/idea/get/");

    let postParams = {idea_id: this.idea_id}
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.http.post(path,postParams,{headers: headers}).subscribe(res => {
      console.log(res);
      this.selectedIdea = res.json()['idea'];
      console.log(this.selectedIdea)
      console.log(this.selectedIdea['owner_id'])
      console.log(this.selectedIdea._id)
      this.request = this.navParams.get('request')
      this.request_check = 0;

      this.request = this.navParams.get('request');

      this.idea_id = this.navParams.get('idea_id');
      if(this.request){
        this.request_check = 1;
      }
      this.show = 1;
      this.storage.get('userid').then((uid)=>{
        this.userid = uid;

        if(this.userid == this.selectedIdea.owner_id){
          this.show = 0;}
        console.log(this.userid);
      });
        console.log(this.selectedIdea.links);
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

  }
  request_colab(){
    let url = Enums.APIURL.URL1;
    let path = url.concat("/ideas/insert_colaborator/")
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let postParams = {ideas_id: this.selectedIdea['_id'],colab_id: this.userid}
    this.http.post(path,postParams,{headers: headers})
  }

  profile(id){
    this.navCtrl.push(ProfilePage,{userid:this.userid})
  }
  accept(request,i){
    let url = Enums.APIURL.URL1;
    let path = url.concat("/ideas/update_members/")
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let postParams = {ideas_id: this.selectedIdea['_id'],member_id:request['member_id'],mode:request['mode']}
    this.http.post(path,postParams,{headers: headers})
    this.request.splice(i,1)
  }
  reject(request,i){
    this.request.splice(i,1)
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
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad IdeasDetailsPage');
  }

}
