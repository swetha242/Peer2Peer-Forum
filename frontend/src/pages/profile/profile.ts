import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import * as Enums from '../../assets/apiconfig';
import { Http, Headers } from '@angular/http';


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
  profileDetails : { name : string, age : number, numberOfQuestionsAnswered : number,
  gender : string, numberOfUpvotes : number ,emailId : string, topTags : Array<string>, topSubjects : Array<string>,
numberOfNotesUploaded : number, numberofProjectIdeas : number, numberOfViewsForNotes : number,
numberOfQuestionsAsked : number};
  constructor(public navCtrl: NavController, public navParams: NavParams,public http: Http) {

    this.profileDetails= { name : "Sai Rohit S",
    age : 21,
    numberOfQuestionsAnswered: 20,
    gender : "Male",
    emailId : "srth21@gmail.com",
    numberOfUpvotes : 200,
    topTags : ["LinkedList", "Arrays"],
    topSubjects : ["Data Structures", "Algorithms"],
    numberOfNotesUploaded : 10,
    numberofProjectIdeas : 3,
    numberOfQuestionsAsked : 30,
    numberOfViewsForNotes : 90
  };
  /*document.getElementById("details").onload=profile;
  function profile(){
    let postParams = this.profileDetails;
    let headers = new Headers();
        headers.append('Content-Type', 'application/json');

        let url = Enums.APIURL.URL1;
        let path = url.concat( "/profile");
        console.log(postParams);


        this.http.post(path, postParams, {headers: headers})
          .subscribe(res => {
 
            let data = res.json();
            console.log(data)
            //this.token = data.token;
            //this.storage.set('token', data.token);
            //resolve(data);
 
          }, (err) => {
            console.log(err);
            //reject(err);
          });
  }*/

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ProfilePage');
  }

}
