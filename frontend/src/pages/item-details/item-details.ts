import { Component } from '@angular/core';

import { NavController, NavParams } from 'ionic-angular';


@Component({
  selector: 'page-item-details',
  templateUrl: 'item-details.html'
})
export class ItemDetailsPage {
  selectedItem: any;
  answersGet: Array<{number : number,atext: string, author: string, numberOfLikes : number}>;

  answers: Array<{number : number,atext: string, author: string, numberOfLikes : number}>;


  constructor(public navCtrl: NavController, public navParams: NavParams) {
    // If we navigated to this page, we will have an item available as a nav param
    this.selectedItem = navParams.get('item');
    this.answersGet=navParams.get('answer');

    console.log(this.answersGet[1]);

    this.answers=[];
    for(let i = 0; i < 10; i++) {

      this.answers.push({
        number : this.answersGet[i].number,
        atext: this.answersGet[i].atext,
        author: this.answersGet[i].author,
        numberOfLikes : this.answersGet[i].numberOfLikes

      });
    }
  }
}
