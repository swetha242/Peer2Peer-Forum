import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import {RecoQuestionsPage} from '../reco-questions/reco-questions';
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
  globalTrend: {qno: number, top3Contributors: Array<string>,
    top3Tags : Array<string>, topSubjects : Array<string>,  totalNumberOfNotes : number, totalNumberOfProjects : number};

    personalTrend: {qno: number,top3Tags : Array<string>, topSubjects : Array<string>,  totalNumberOfNotes : number, totalNumberOfProjects : number};

  constructor(public navCtrl: NavController, public navParams: NavParams) {

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

}
