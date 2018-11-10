import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

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
  constructor(public navCtrl: NavController, public navParams: NavParams) {

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



  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ProfilePage');
  }

}
