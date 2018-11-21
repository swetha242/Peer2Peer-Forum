import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import {RecoQuestionsPage} from '../reco-questions/reco-questions';
import {RecoNotesPage} from '../reco-notes/reco-notes';
import { ListPage } from '../list/list';
import { Storage } from '@ionic/storage';
import { NotesPage} from '../notes/notes';
import { IdeasProjectsPage } from '../ideas-projects/ideas-projects';
import { AuthProvider } from '../../providers/auth/auth';
import * as Enums from '../../assets/apiconfig';
import { fn } from '@angular/compiler/src/output/output_ast';
import { Http, Headers } from '@angular/http';
/**
 * Generated class for the LaunchPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-launch',
  templateUrl: 'launch.html',
})
export class LaunchPage {

  userid:any;
  uname:any;
  //is_student:any;
  selectedSubject : any;
  subjects : Array<string>;
  qno_g: number;
  top3Contributors_g: Array<string>;
  top3Tags_g : Array<string>;
  topSubjects_g : Array<string>;
  totalNumberOfNotes_g : number;
  totalNumberOfProjects_g : number;

  qno_l: number;
  top3Tags_l : Array<string>;
   topSubjects_l : Array<string>;
     totalNumberOfNotes_l : number;
      totalNumberOfProjects_l : number;


  constructor(public navCtrl: NavController, public authService: AuthProvider , public navParams: NavParams, private alertCtrl: AlertController,public storage:Storage,public http: Http)
  {



    this.topSubjects_g=[];
    this.topSubjects_l=[];

    this.storage.get('userid').then((uid)=>
    {
      //console.log(result)
       this.setuid(uid);

    });




    let postParams = {}
    let headers = new Headers();

    headers.append('Content-Type','application/json');
    let url = Enums.APIURL.URL1;
    let path = url.concat('/subjects/getList');

    this.http.post(path,postParams,{headers:headers})
    .subscribe(res => {
      console.log(res);
      let subjectsList = res.json()['subjects'];
      this.subjects = subjectsList;
    });
    //this.subjects=["Machine Learning","Compiler Design", "Data Structures", "Algorithms"];


  }
  setTrends()
  {
    let postParams = {userid : this.userid};
    let headers =new Headers();

    headers.append('Content-Type','application/json');
    let url = Enums.APIURL.URL1;
    let path = url.concat('/get_trends');

    console.log(postParams);

    this.http.post(path,postParams,{headers:headers})
    .subscribe(res => {
      console.log("Starting call");
      console.log(res);

      let globalTrends = res.json()['global'];
      let localTrends = res.json()['local'];

      console.log(globalTrends);



        this.qno_g = globalTrends['qno'];
        this.totalNumberOfNotes_g = globalTrends['nno'];
        this.totalNumberOfProjects_g = globalTrends['ino'];

        this.top3Tags_g = globalTrends['tag'];
        this.topSubjects_g = globalTrends['subject'];
        this.top3Contributors_g = globalTrends['contrib']['names'];




        this.qno_l = localTrends['qno'];
        this.totalNumberOfNotes_l = localTrends['nno'];
        this.totalNumberOfProjects_l = localTrends['ino'];

        this.top3Tags_l = localTrends['tag'];
        this.topSubjects_l = localTrends['subject'];




    })
  }
  setuid(res)
  {
    this.userid=res;
    console.log(this.userid);
    this.setTrends();

  }


  ionViewDidLoad() {
    console.log('ionViewDidLoad LaunchPage');
  }

  openQuestions(event) {
    this.navCtrl.push(RecoQuestionsPage, {}
    );
  }

  openNotes(event)
  {
    this.navCtrl.push(RecoNotesPage, {}
    );
  }

  openProjects(event)
  {

  }

  callQuestions()
  {
    console.log('hello1')
      console.log(this.userid)
    this.navCtrl.push(ListPage, { subject : this.selectedSubject}
    );
  }
  presentAlertQuestions() {
  let alert = this.alertCtrl.create();
  alert.setTitle('Select Subject');
  for(let i = 0; i < this.subjects.length; i++)
  {

    alert.addInput({type: 'radio', label: this.subjects[i], value: this.subjects[i]});

  }
  alert.present();
  alert.addButton('Cancel');
  alert.addButton({
      text: 'OK',
      handler: data => {
        console.log('Site:', data);
        this.selectedSubject = data;

        //this.storage.set("nsSite", data);
        //this.site = data;
        this.callQuestions();
      }
    });
}


callNotes()
{
  this.navCtrl.push(NotesPage, { subject : this.selectedSubject}
  );
}
presentAlertNotes() {
let alert = this.alertCtrl.create();
alert.setTitle('Select Subject');
for(let i = 0; i < this.subjects.length; i++)
{

  alert.addInput({type: 'radio', label: this.subjects[i], value: this.subjects[i]});

}
alert.present();
alert.addButton('Cancel');
alert.addButton({
    text: 'OK',
    handler: data => {
      console.log('Site:', data);
      this.selectedSubject = data;

      //this.storage.set("nsSite", data);
      //this.site = data;
      this.callNotes();
    }
  });
}


 callProjects(){
   this.navCtrl.push(IdeasProjectsPage, { subject : this.selectedSubject}
 );
 }
 presentAlertProjects() {
 let alert = this.alertCtrl.create();
 alert.setTitle('Select Subject');
 for(let i = 0; i < this.subjects.length; i++)
 {

   alert.addInput({type: 'radio', label: this.subjects[i], value: this.subjects[i]});

 }
 alert.present();
 alert.addButton('Cancel');
 alert.addButton({
     text: 'OK',
     handler: data => {
       console.log('Site:', data);
       this.selectedSubject = data;

       //this.storage.set("nsSite", data);
       //this.site = data;
       this.callProjects();
     }
   });
 }


}
