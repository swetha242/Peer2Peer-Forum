import { Component } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { NavController, NavParams } from 'ionic-angular';
import * as Enums from '../../assets/apiconfig';
import { ItemDetailsPage } from '../item-details/item-details';
import { Storage } from '@ionic/storage';
import { ViewChild } from '@angular/core';
import { Navbar } from 'ionic-angular';
import { LaunchPage } from '../launch/launch';
//import { ListPage } from '../list/list'
@Component({
  selector: 'page-list',
  templateUrl: 'list.html'
})
export class ListPage {
  items: Array<{description:string,subject:string,qid:string,owner:string,title:string,tag:Array<"">}>;
  answers: Array<{aid:string,answeredby : string,teacher: number,content:string,upvote:number,downvote:number,answeredbyname:string}>;
  items1: Array<{description:string,subject:string,qid:string,owner:string,title:string,tag:Array<"">}>;
  //items2 : Array<""> 
  //the question asked by user
  question:string;
  title:string;
  tags:string;
  
  //userid from prev page
  userid = this.navParams.get('userid');
  subject=this.navParams.get('subject');
  searchQuery: string ='';
  @ViewChild(Navbar) navBar: Navbar;
  
  constructor(public navCtrl: NavController, public navParams: NavParams,public http: Http, public storage: Storage) {

    this.items1 = []
    this.answers=[];
    
   
    console.log(this.userid);
    this.initializeItemsbegin();
    }
initializeItemsbegin()
{
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
               tag : data[i].tags,
               title : data[i].title,
               description : data[i].description
             })
             console.log('initialize')
             console.log(this.items1)           
           }
           // let ques=data['questions'];
            //traverse the questions array
          
  });
}

initializeItems(ev){
     
  this.items1=[]  
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
               
                return (item.description.toLowerCase().indexOf(val.toLowerCase()) > -1);
              })
            }

          }, (err) => {
            console.log(err);

          });

          console.log('out1')
          console.log(this.items1)
 
  }
  getItems(ev: any) {
    // Reset items back to all of the items
    this.initializeItems(ev);


}

  askques(){
    //send question,userid and subject
    let self=this;
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
            console.log('refreshing')
            let t= [] 
            t.push(postParams.tags)
            console.log(t)
            self.items1.push({
              subject : this.subject,
              qid : data['qid'],
              owner : data['name'],
              tag : t,
              title : postParams.title,
              description : postParams.description
            });
      //      this.navCtrl.push(ListPage)

          }, (err) => {
            console.log(err);
            //reject(err);
          });
          //this.navCtrl.push(ListPage, {subject:this.subject,userid:this.userid})

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
                aid:data[i]._id,
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

    onCancel(ev){
      console.log('pressed cancel')
      return 0;
    }

    
    
}
