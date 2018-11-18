import { Component } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { NavController, NavParams } from 'ionic-angular';
import * as Enums from '../../assets/apiconfig';
import { ViewnotesPage} from '../viewnotes/viewnotes';
import { Storage } from '@ionic/storage';
import { ViewChild } from '@angular/core';
import { Navbar } from 'ionic-angular';
import { LaunchPage } from '../launch/launch';

/**
 * Generated class for the NotesPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


@Component({
  selector: 'page-notes',
  templateUrl: 'notes.html',
})
export class NotesPage {

  items: Array<{title: string, author: string, number : number, qtext : string, upvote : number, downvote : number, nid : string}>;
  userid:any;
  subject=this.navParams.get('subject');

  title:string;
  summary:string;
  @ViewChild(Navbar) navBar: Navbar;

  constructor(public navCtrl: NavController, public navParams: NavParams,public http: Http,public storage:Storage) {
    console.log("notes page starts here");

    this.items = [];
    this.storage.get('userid').then((uid) => {
      this.setuid(uid)
    });
    let postParams = {subject:this.subject, upl_by:this.userid}
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    let path="http://127.0.0.1:5000/notes/list"
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
            title: data[i].subject,
            author: data[i].upl_by,
            qtext : data[i].summary,
            when: data[i].time,
            upvote: data[i].upvotes,
            downvote: data[i].downvotes,
          });
        }
      }, (err) => {
             console.log(err);
      });
  }
  setuid(res)
  {
    this.userid=res;
    console.log(this.userid)
  }
  base64: any;
  fun(b64Data,ty)
  {
    //console.log(b64Data)
    //console.log(this.userid);
    let x=b64Data.split(',')[1]
    //http call to upload notes where x is base64 rep- when islink is 1 data will have link- anyways not sure if link will work
    console.log(this.userid)
    let postParams = {'upl_by':this.userid,'userid':this.userid,'subject':this.subject,'tag':this.subject,'course':'BTech','title':'Reverse Ajax','summary':'xxxx','data':x,'islink':0}
     let headers = new Headers();
     headers.append('Content-Type','application/json');

         let path="http://127.0.0.1:5000/notes/upload"

         this.http.post(path, postParams, {headers: headers})
           .subscribe(res => {
             //let data = res.json();
             console.log(res)

           }, (err) => {
             console.log(err);

           });


  }
  onUploadChange(ev) {
    let file = ev.target.files[0];
    console.log(file.type)
  let fileReader = new FileReader();
            let self=this;
            // Onload of file read the file content
            fileReader.addEventListener("load", function () {
              self.base64 = fileReader.result;
              //console.log(self.base64);
              self.fun(self.base64,file.type);
            }, false);
            // Convert data to base64
            fileReader.readAsDataURL(file);
  //console.log(postParams)
  //console.log(this.base64);
  }
  upload() {

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

    let postParams = {nid:item.nid,uid:item.answeredby}
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
  download(){
    let postParams = {'userid':'5be700b0655e4e1078388cbc','notesid':'5be72447655e4e19b4be7f27'}
     let headers = new Headers();
     headers.append('Content-Type','application/json');

         let path="http://127.0.0.1:5000/notes/view"

         this.http.post(path, postParams, {headers: headers})
           .subscribe(res => {

             console.log(res)
             let data = res.json();
             var byteCharacters = atob(data['data']);
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
  ionViewDidLoad() {
    console.log('ionViewDidLoad NotesPage');
  }
    itemTapped(event, item) {
    this.navCtrl.push(ViewnotesPage, { item: item }
    );
  }
}
