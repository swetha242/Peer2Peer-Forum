import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import * as Enums from '../../assets/apiconfig';
import { Http, Headers } from '@angular/http';
import { Storage } from '@ionic/storage';

/**
 * Generated class for the ProfilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {
  userid:any;
  name : string;
   numberOfQuestionsAnswered : number;
    numberOfUpvotes : number ;
    emailId : string;
     topTags : Array<string>;
      topSubjects : Array<string>;
numberOfNotesUploaded : number;
 numberofProjectIdeas : number;
  numberOfViewsForNotes : number;
numberOfQuestionsAsked : number;
  constructor(public navCtrl: NavController, public navParams: NavParams,public http: Http,public storage:Storage) {

    this.topTags=[]
    this.topSubjects=[]
    this.userid = this.navParams.get('userid')
    if(this.userid == null){
      this.storage.get('userid').then((uid)=>{
        this.userid = uid
        console.log(this.userid)
      })
    }
    this.sendreq()
  }
    sendreq()
    {
    let postParams = {userid:this.userid};
    let headers = new Headers();
        headers.append('Content-Type', 'application/json');

        let url = Enums.APIURL.URL1;
        let path = url.concat( "/profile");
        console.log(postParams);


        this.http.post(path, postParams, {headers: headers})
          .subscribe(res => {

            let data = res.json()['profile'];
            console.log(data)
            this.name=data['name']

            this.numberOfQuestionsAnswered= data['ques_ans']
            this.emailId = data['email']
            this.numberOfUpvotes = data['ans_upvote']
            //this.topTags = data['topTags']
            if(data['topTags'].length!=0)
              {
                this.topTags = data['topTags']
              }
            //this.topSubjects = data['topSubjects']
            if(data['topSubjects'].length!=0)
              {
                this.topSubjects = data['topSubjects']
              }
            this.numberOfNotesUploaded = data['notes_upl']
            this.numberofProjectIdeas = data['proj_ideas']
            this.numberOfQuestionsAsked = data['ques_ask']
            this.numberOfViewsForNotes = data['view_notes']

            //this.token = data.token;
            //this.storage.set('token', data.token);
            //resolve(data);

          }, (err) => {
            console.log(err);
            //reject(err);
          });
  }



  ionViewDidLoad() {
    console.log('ionViewDidLoad ProfilePage');
  }

}
