import { Component } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { NavController, NavParams } from 'ionic-angular';
import * as Enums from '../../assets/apiconfig';
import { ItemDetailsPage } from '../item-details/item-details';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-list',
  templateUrl: 'list.html'
})
export class ListPage {
  items: Array<{title: string, author: string, number : number, qtext : string}>;
  answers: Array<{number : number,atext: string, author: string, numberOfLikes : number}>;
  //the question asked by user
  question:string;
  //userid from prev page
  userid = this.navParams.get('userid');
  subject=this.navParams.get('subject');
  constructor(public navCtrl: NavController, public navParams: NavParams,public http: Http, public storage: Storage) {

    this.items = [];
    this.answers=[];
    console.log(this.userid);
    //console.log(this.subject);
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
    
     //send question,userid and subject
     let postParams = {subject:this.subject}
     let headers = new Headers();
     headers.append('Content-Type', 'application/json');

         let url = Enums.APIURL.URL1;
         let path = url.concat( "/getques");
         console.log(postParams);

         this.http.post(path, postParams, {headers: headers})
           .subscribe(res => {

             let data = res.json();
             console.log(data)
             let ques=data['questions'];
             //traverse the questions array


           }, (err) => {
             console.log(err);

           });
  }

  askques(){
    //send question,userid and subject
    let postParams = {question : this.question,userid:this.userid,subject:this.subject}//add title
    let headers = new Headers();
        headers.append('Content-Type', 'application/json');

        let url = Enums.APIURL.URL1;
        let path = url.concat( "/askques");
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
  }
  itemTapped(event, item) {
    
    this.navCtrl.push(ItemDetailsPage, { item: item , answer: this.answers}
    );
  }

}
