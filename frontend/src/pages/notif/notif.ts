import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import * as Enums from '../../assets/apiconfig';
import { Http, Headers } from '@angular/http';
import { IdeasDetailsPage } from '../ideas-details/ideas-details';
import { IdeasDetailsInteractPage } from '../ideas-details-interact/ideas-details-interact'

/**
 * Generated class for the NotifPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-notif',
  templateUrl: 'notif.html',
})
export class NotifPage {

  userid:any;
  requests: any;
  accepts: any;

  qa: Array<{notif_id:string,answer:string,msg:string,qid:string,read:Number}>;
  constructor(public storage:Storage,public navCtrl: NavController, public navParams: NavParams,public http:Http) {
    this.qa=[]
    this.requests = []
    this.accepts = []
    this.storage.get('userid').then((uid) => {
      this.setuid(uid)
    });
    console.log(this.userid)
  }
  setuid(res)
  {
    this.userid=res;
    console.log(this.userid)
    this.getnotif()
  }
  getnotif()
  {
    let postParams = {userid:this.userid}
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

        let url = Enums.APIURL.URL1;
        let path = url.concat( "/get_notif");
        console.log(postParams);

        this.http.post(path, postParams, {headers: headers})
          .subscribe(res => {
           console.log(res)
            let data = res.json()['notif'];
           for(let i in data){
             if(data[i].type==1){

              this.qa.push({
               notif_id: data[i].notif_id,
               qid : data[i].qid,
               msg : data[i].msg,
               answer : data[i].ans,
               read : data[i].read
             })
            }
            if(data[i].type == 5 || data[i].type == 2 || data[i].type == 6){
              let mode_val = 1
              if(data[i].type == 2){
                mode_val = 0;
              }
              let userid;
              if(data[i].type == 6){
                userid = this.userid;
              }
              else{
                userid = data[i].colab_id;
              }
              this.requests.push({
                idea_id: data[i].project_id,
                time: data[i].time,
                msg: data[i].msg,
                read: data[i].read,
                mode: mode_val,
                member_id: userid,
                userid: this.userid,
                notif_id:data[i].notif_id
              })
            }
            else{
              this.accepts.push({
                idea_id: data[i].project_id,
                msg: data[i].msg
              })
            }
             console.log('initialize')
             console.log(data[i])
           }
           // let ques=data['questions'];
            //traverse the questions array

  });

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad NotifPage');
  }
 mark_as_read(item)
 {
  let index = this.qa.indexOf(item);
    if (index !== -1) {
        this.qa.splice(index, 1);
    }
    let postParams = {userid:this.userid,notif_id:item.notif_id}
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

        let url = Enums.APIURL.URL1;
        let path = url.concat( "/notif/mark_as_read");
        console.log(postParams);

        this.http.post(path, postParams, {headers: headers})
          .subscribe(res => {
           console.log(res);

  });
 }
 normalClick(request){
   console.log("WEIRD")
   this.navCtrl.push(IdeasDetailsInteractPage,{idea_id: request.idea_id});
 }
 requestClick(request){
     this.navCtrl.push(IdeasDetailsInteractPage,{idea_id: request.idea_id,request:request})
     this.mark_as_read(request)
 }

}
