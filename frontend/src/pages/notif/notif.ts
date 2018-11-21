import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import * as Enums from '../../assets/apiconfig';
import { Http, Headers } from '@angular/http';
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
  qa: Array<{notif_id:string,answer:string,msg:string,qid:string,read:Number}>;
  constructor(public storage:Storage,public navCtrl: NavController, public navParams: NavParams,public http:Http) {
    
    this.qa=[]
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

}
