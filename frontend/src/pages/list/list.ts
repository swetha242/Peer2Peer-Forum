import { Component } from '@angular/core';

import { NavController, NavParams } from 'ionic-angular';

import { ItemDetailsPage } from '../item-details/item-details';

@Component({
  selector: 'page-list',
  templateUrl: 'list.html'
})
export class ListPage {
  items: Array<{title: string, author: string, number : number, qtext : string}>;
  answers: Array<{number : number,atext: string, author: string, numberOfLikes : number}>;

  constructor(public navCtrl: NavController, public navParams: NavParams) {

    this.items = [];
    this.answers=[];
    for(let i = 1; i < 11; i++) {
      this.items.push({
        number : i,
        title: 'Linked List Deletion',
        author: 'sai',
        qtext : "What is the time complexity of deletion in a linked list?"

      });

      this.answers.push({
        number : i,
        atext: "It is O(n).",
        author: "sondhi",
        numberOfLikes : 10

      });
    }
  }

  itemTapped(event, item) {
    this.navCtrl.push(ItemDetailsPage, { item: item , answer: this.answers}
    );
  }

}
