import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import {RecoQuestionsPage} from '../reco-questions/reco-questions';
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
  selectedSubject : any;
  subjects : Array<string>;
  globalTrend: {qno: number, top3Contributors: Array<string>,
  top3Tags : Array<string>, topSubjects : Array<string>,  totalNumberOfNotes : number, totalNumberOfProjects : number};

  personalTrend: {qno: number,top3Tags : Array<string>, topSubjects : Array<string>,  totalNumberOfNotes : number, totalNumberOfProjects : number};


  constructor(public navCtrl: NavController, public authService: AuthProvider , public navParams: NavParams, private alertCtrl: AlertController,public storage:Storage,public http: Http) {

    this.globalTrend = {qno : 120,
      totalNumberOfNotes : 20,
      totalNumberOfProjects : 45,

      top3Tags : ["Linked List", "Neural Networks", "C++"],
      topSubjects : ["Compiler Design", "Data Structures", "Machine Learning"],
      top3Contributors : ["sai", "sondhi", "swetha"]

    };
    this.storage.get('userid').then((uid)=>
    {
      //console.log(result)
       this.setuid(uid)
    });

    this.personalTrend = { qno : 12,
      totalNumberOfNotes : 5,
      totalNumberOfProjects : 4,

      top3Tags : ["Linked List", "Neural Networks", "C++"],
      topSubjects : ["Compiler Design", "Data Structures", "Machine Learning"]

    };

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
  setuid(res)
  {
    this.userid=res;
    console.log(this.userid)
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
