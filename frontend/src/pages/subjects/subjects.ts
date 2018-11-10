import { Component } from '@angular/core';
import { NavController,NavParams, AlertController, LoadingController, Loading, IonicPage } from 'ionic-angular';
import { ListPage } from '../list/list';
/**
 * Generated class for the MainPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-main',
  templateUrl: 'subjects.html',
})
export class SubjectsPage {

    searchQuery: string ='';
    items: string[];
    userid = this.navParams.get('userid');
    constructor(public navCtrl: NavController, public navParams: NavParams) {
      //this.initializeItems();
    }
    initializeItems(){
      this.items = [
        'Chemistry',
        'Physics',
        'Maths',
        'Operating System',
        'Computer Network',
        'Software Engineering'
      ];
    }
    choosesub(it)
    {
      this.navCtrl.push(ListPage,{ userid: this.userid,subject:it});
    }
    getItems(ev) {
      // Reset items back to all of the items
      this.initializeItems();
      console.log(this.userid)
      // set val to the value of the ev target
      var val = ev.target.value;

      // if the value is an empty string don't filter the items
      if (val && val.trim() != '') {
        this.items = this.items.filter((item) => {
          return (item.toLowerCase().indexOf(val.toLowerCase()) > -1);
        })
      }
    }


    ionViewDidLoad() {
      console.log('ionViewDidLoad MainPage');
    }

  }
