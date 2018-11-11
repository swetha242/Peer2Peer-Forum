import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import {RecoQuestionsPage} from '../reco-questions/reco-questions';
import { ListPage } from '../list/list';
import { ViewnotesPage} from '../viewnotes/viewnotes';
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

  selectedSubject : any;
  subjects : Array<string>;
  globalTrend: {qno: number, top3Contributors: Array<string>,
    top3Tags : Array<string>, topSubjects : Array<string>,  totalNumberOfNotes : number, totalNumberOfProjects : number};

    personalTrend: {qno: number,top3Tags : Array<string>, topSubjects : Array<string>,  totalNumberOfNotes : number, totalNumberOfProjects : number};

  constructor(public navCtrl: NavController, public navParams: NavParams, private alertCtrl: AlertController) {

    this.globalTrend = {qno : 120,
      totalNumberOfNotes : 20,
      totalNumberOfProjects : 45,

      top3Tags : ["Linked List", "Neural Networks", "C++"],
      topSubjects : ["Compiler Design", "Data Structures", "Machine Learning"],
      top3Contributors : ["sai", "sondhi", "swetha"]

    };

    this.personalTrend = { qno : 12,
      totalNumberOfNotes : 5,
      totalNumberOfProjects : 4,

      top3Tags : ["Linked List", "Neural Networks", "C++"],
      topSubjects : ["Compiler Design", "Data Structures", "Machine Learning"]

    };

    this.subjects=["Machine Learning","Compiler Design", "Data Structures", "Algorithms"];


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
  this.navCtrl.push(ViewnotesPage, { subject : this.selectedSubject}
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


// callProjects()
// {
//   this.navCtrl.push(ProjectsPage, { subject : this.selectedSubject}
//   );
// }
// presentAlertProjects() {
// let alert = this.alertCtrl.create();
// alert.setTitle('Select Subject');
// for(let i = 0; i < this.subjects.length; i++)
// {
//
//   alert.addInput({type: 'radio', label: this.subjects[i], value: this.subjects[i]});
//
// }
// alert.present();
// alert.addButton('Cancel');
// alert.addButton({
//     text: 'OK',
//     handler: data => {
//       console.log('Site:', data);
//       this.selectedSubject = data;
//
//       //this.storage.set("nsSite", data);
//       //this.site = data;
//       this.callProjects();
//     }
//   });
// }


}
