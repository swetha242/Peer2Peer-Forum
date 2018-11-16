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
  items: Array<{description:string,subject:string,qid:string,owner:string,upvotes:number,downvotes:number,title:string,tag:Array<"">}>;
  answers: Array<{answeredby : string,teacher: number,content:string,upvote:number,downvote:number,answeredbyname:string}>;
  items1: Array<{description:string,subject:string,qid:string,owner:string,upvotes:number,downvotes:number,title:string,tag:Array<"">}>;
  //items2 : Array<"">
  //the question asked by user
  question:string;
  title:string;
  tags:string;
  //userid from prev page
  userid = this.navParams.get('userid');
  subject=this.navParams.get('subject');
  constructor(public navCtrl: NavController, public navParams: NavParams,public http: Http, public storage: Storage) {

    this.items = [];
    this.items1 = []
    this.answers=[];
    console.log(this.userid);
    //console.log(this.subject);


     //send question,userid and subject
     let postParams = {subject:this.subject}
     let headers = new Headers();
     headers.append('Content-Type', 'application/json');

         let url = Enums.APIURL.URL1;
         let path = url.concat( "/qa/qlist");
         console.log(postParams);

         this.http.post(path, postParams, {headers: headers})
           .subscribe(res => {
            console.log(res)
             let data = res.json()['question'];
            for(let i in data){
              this.items.push({
                subject : data[i].subject,
                qid : data[i]._id,
                owner : data[i].asked_by_n,
                upvotes : data[i].upvotes,
                downvotes: data[i].downvotes,
                tag : data[i].tags,
                title : data[i].title,
                description : data[i].description
              });


            }
            // let ques=data['questions'];
             //traverse the questions array


           }, (err) => {
             console.log(err);

           });
  }

  askques(){
    //send question,userid and subject
    let postParams = {description : this.question,asked_by:this.userid,subject:this.subject,title:this.title,tags:this.tags}
    let headers = new Headers();
        headers.append('Content-Type', 'application/json');

        let url = Enums.APIURL.URL1;
        let path = url.concat( "/qa/ask");
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
           this.navCtrl.push(ListPage, {subject:this.subject});

  }
  itemTapped(event, item)
  {
    let postParams = {}
    let headers = new Headers();
        headers.append('Content-Type', 'application/json');

        let url = Enums.APIURL.URL1;
        let path = url.concat( "/qa/");
        path=path.concat(item.qid)
        path=path.concat('/answers')
        console.log(path);


        this.http.get(path, {headers: headers})
          .subscribe(res => {


            let data = res.json()['answer'];
            for(let i in data){
              this.answers.push({
                answeredby : data[i].answered_by,
                teacher : data[i].teacher,
                content : data[i].content,
                upvote : data[i].upvotes,
                downvote: data[i].downvotes,
                answeredbyname: data[i].answered_by_n
                }
              )}
            console.log(this.answers)
            //this.token = data.token;
            //this.storage.set('token', data.token);
            //resolve(data);

            this.navCtrl.push(ItemDetailsPage, { item: item , answer: this.answers,userid:this.userid});

          }, (err) => {
            console.log(err);
            //reject(err);
          });

    }
    initializeItems(ev){

      let postParams = {description : this.question,asked_by:this.userid,subject:this.subject,title:this.title,tags:this.tags}
      let headers = new Headers();
      headers.append('Content-Type', 'application/json');

          let url = Enums.APIURL.URL1;
          let path = url.concat( "/qa/qlist");
          console.log(postParams);

          this.http.post(path, postParams, {headers: headers})
            .subscribe(res => {
             console.log(res)
              let data = res.json()['question'];
             for(let i in data){
                 this.items1.push({
                 subject : data[i].subject,
                 qid : data[i]._id,
                 owner : data[i].asked_by_n,
                 upvotes : data[i].upvotes,
                 downvotes: data[i].downvotes,
                 tag : data[i].tags,
                 title : data[i].title,
                 description : data[i].description
               });
               console.log('initialize')
               console.log(this.items1)



             }
             // let ques=data['questions'];
              //traverse the questions array


              console.log('out')
              console.log(this.items1)
              console.log('val')
              console.log(ev.target.value)
              var val = ev.target.value
              if (val && val.trim() != '') {
                this.items1 = this.items1.filter((item) => {
                  console.log('here')
                  console.log(item.description.toLowerCase().indexOf(val.toLowerCase()) > -1)
                  console.log('finished')
                  return (item.description.toLowerCase().indexOf(val.toLowerCase()) > -1);
                })
              }

            }, (err) => {
              console.log(err);

            });

            console.log('out1')
            console.log(this.items1)
   /*   this.items = [
        'Chemistry',
        'Physics',
        'Maths',
        'Operating System',
        'Computer Network',
        'Software Engineering'
      ];*/
    }
    getItems(ev) {
      // Reset items back to all of the items
      this.initializeItems(ev);
  //  console.log(ev.target.description)
      // set val to the value of the ev target
/*      var val = ev.target.value;
      console.log('this is val')
      console.log(val)
      console.log('here')
      console.log(this.items1)
      console.log('finished')
      if (val && val.trim() != '') {
        this.items1 = this.items1.filter((item) => {
          console.log('here')
          console.log(item.description.toLowerCase().indexOf(val.toLowerCase()) > -1)
          console.log('finished')
          return (item.description.toLowerCase().indexOf(val.toLowerCase()) > -1);
        })
      }

 /*   choosesub(it)
    {
      this.navCtrl.push(ListPage,{ description: this.q});
    }*/


  }
}
