import { Component } from '@angular/core';
import { IonicPage} from 'ionic-angular';
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
    constructor() {
      this.initializeItems();
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
    getItems(ev) {
      // Reset items back to all of the items
      this.initializeItems();

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
