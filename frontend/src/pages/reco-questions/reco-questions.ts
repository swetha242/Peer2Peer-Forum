import { Component } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { NavController, NavParams } from 'ionic-angular';
import * as Enums from '../../assets/apiconfig';
import { ItemDetailsPage } from '../item-details/item-details';
import { Storage } from '@ionic/storage';
import { ViewChild } from '@angular/core';
import { Navbar } from 'ionic-angular';
import { LaunchPage } from '../launch/launch';

@Component({
  selector: 'page-list',
  templateUrl: 'reco-questions.html'
})
export class RecoQuestionsPage
{
  //reco : false;

  items: Array<{description:string,subject:string,qid:string,owner:string,title:string,tag:Array<"">}>;
  answers: Array<{aid:string,answeredby : string,teacher: number,content:string,upvote:number,downvote:number,answeredbyname:string}>;
  items1: Array<{description:string,subject:string,qid:string,owner:string,title:string,tag:Array<"">}>;

  //the question asked by user
  question:string;
  title:string;
  tags:string;
  userid:any;

  //userid from prev page
  //userid = this.navParams.get('userid');
  subject=this.navParams.get('subject');

  @ViewChild(Navbar) navBar: Navbar;

  constructor(public navCtrl: NavController, public navParams: NavParams,public http: Http, public storage: Storage)
  {
    //this.reco = navParams.get('reco');

    this.items1 = [];
    this.answers=[];
    console.log("hello world");

    this.storage.get('userid').then((uid) => {
      this.setuid(uid);
      this.initializeItemsbegin();
    });


    //console.log(this.userid);


    // for(let i = 1; i < 11; i++)
    //   {
    //     this.items.push
    //     ({
    //       //number : i,
    //       title: 'Linked List Deletion',
    //       author: 'srth21',
    //       qtext : "What is the time complexity of deletion in a linked list?"
    //
    //     });
    //
    //     this.answers.push
    //     ({
    //       //number : i,
    //       atext: "It is O(n).",
    //       author: "sondhi",
    //       numberOfLikes : 10
    //
    //     });
    //   }
  }

    setuid(res)
    {
      this.userid = res;
      console.log("user id is : ",this.userid);
    }

    initializeItemsbegin()
    {
        let postParams = {asked_by : this.userid}
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');

            let url = Enums.APIURL.URL1;
            let path = url.concat( "/qa/recoqa");
            console.log(this.userid);
            console.log(postParams);

            this.http.post(path, postParams, {headers: headers})
              .subscribe(res => {
               console.log(res);
               console.log("data");
                let data = res.json()['questions'];
                console.log("data");
                console.log(data);
               for(let i in data){
                   this.items1.push({
                   subject : data[i].subject,
                   qid : data[i].qid,
                   owner : data[i].owner,
                   tag : data[i].tags,
                   title : data[i].title  ,
                   description : data[i].description
                 })
                 console.log('initialize');
                 console.log(this.items1);
               }
               // let ques=data['questions'];
                //traverse the questions array

      });
    }

  itemTapped(event, item) {
    this.navCtrl.push(ItemDetailsPage, { item: item , answer: this.answers}
    );
  }

}
