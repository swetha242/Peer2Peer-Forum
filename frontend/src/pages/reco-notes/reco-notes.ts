import { Component } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { NavController, NavParams, Platform } from 'ionic-angular';
import * as Enums from '../../assets/apiconfig';
import { ItemDetailsPage } from '../item-details/item-details';
import { Storage } from '@ionic/storage';
import { ViewChild } from '@angular/core';
import { Navbar } from 'ionic-angular';
import { LaunchPage } from '../launch/launch';
import { File } from '@ionic-native/file';
import { FileTransfer } from '@ionic-native/file-transfer';
import { DocumentViewer } from '@ionic-native/document-viewer';
import { ViewnotesPage} from '../viewnotes/viewnotes';

@Component({
  selector: 'page-reco-notes',
  templateUrl: 'reco-notes.html'
})
export class RecoNotesPage{
  items: Array<{title: string, author: string, number : number, qtext : string, upvote : number, downvote : number, nid : string}>;
  userid:any;

  @ViewChild(Navbar) navBar: Navbar;

  constructor(public navCtrl: NavController, public navParams: NavParams,public http: Http,public storage:Storage, private platform: Platform)
  {
    this.items = [];
    this.storage.get('userid').then((uid) => {
      this.setuid(uid);
      this.initializeItemsbegin();
    });
  }
  setuid(res)
  {
    this.userid=res;
    console.log(this.userid)
  }
  initializeItemsbegin()
  {
    console.log(this.userid)
    let postParams = {upl_by:this.userid}
    console.log(postParams)
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    let path="http://127.0.0.1:5000/notes/reconotes"
    //console.log(postParams);

    this.http.post(path, postParams, {headers: headers})
      .subscribe(res => {
        //console.log("this is res");
        //console.log(res)
        let data = res.json()['notes'];
        //console.log("this is data");
        console.log(data);
        let j = 0;
        for(let i in data) {
          this.items.push({
            nid:data[i]._id,
            number : data[i].upvotes,
            title: data[i].title,
            author: data[i].upl_by,
            qtext : data[i].summary,
            upvote: data[i].upvotes,
            downvote: data[i].downvotes,
          });
        }
      }, (err) => {
             console.log(err);
      });
  }
  itemTapped(item) {
    let postParams = {userid:this.userid,notesid:item.nid}
    let headers = new Headers();
    headers.append('Content-Type','application/json');

    let path="http://127.0.0.1:5000/notes/view"

    this.http.post(path, postParams, {headers: headers})
    .subscribe(res => {

      console.log(res)
      let data = res.json();
      console.log(data);
      var byteCharacters = window.atob(data['data']);
      var byteNumbers = new Array(byteCharacters.length);
      for (var i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      var byteArray = new Uint8Array(byteNumbers);
      var blob = new Blob([byteArray], {type: 'application/pdf'});
      //var blobUrl = URL.createObjectURL(blob);
      let pdfUrl = {pdfUrl: URL.createObjectURL(blob)};
      this.navCtrl.push(ViewnotesPage, pdfUrl);

    }, (err) => {
      console.log(err);
    });
  }
  upvote(item){

    //item.upvote=item.upvote+1;
        let postParams = {nid:item.nid,uid:this.userid}
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        let url = Enums.APIURL.URL1;
        let path = url.concat( "/notes/upvote");
        console.log(postParams);

        this.http.post(path, postParams, {headers: headers})
          .subscribe(res => {
            let data=res.json()
            console.log(data)
            if(data['result']=='Success')
            {
              item.upvote=item.upvote+1
            }

          }, (err) => {
            console.log(err);
            //reject(err);
          });
    //console.log(item)
  }
  downvote(item){

    let postParams = {nid:item.nid,uid:this.userid}
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        let url = Enums.APIURL.URL1;
        let path = url.concat( "/notes/downvote");
        console.log(postParams);

        this.http.post(path, postParams, {headers: headers})
          .subscribe(res => {
            let data=res.json()
            console.log(data)
            if(data['result']=='Success')
            {
            item.downvote=item.downvote+1
            }

          }, (err) => {
            console.log(err);
            //reject(err);
          });

    //console.log(item)
  }
}
