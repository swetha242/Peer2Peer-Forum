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
  qa: Array<{notif_id:string,answer:string,msg:string,qid:string}>;
  constructor(public storage:Storage,public navCtrl: NavController, public navParams: NavParams,public http:Http) {
    this.storage.get('userid').then((uid) => {
      this.setuid(uid)
    });
    let postParams = {userid:this.userid}
    /*let headers = new Headers();
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
          
  });*/

  }
  setuid(res)
  {
    this.userid=res;
    console.log(this.userid)
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad NotifPage');
  }

}
