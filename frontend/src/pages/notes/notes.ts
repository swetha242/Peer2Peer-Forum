import { Component } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import * as Enums from '../../assets/apiconfig';
import { ViewnotesPage} from '../viewnotes/viewnotes';
import { Storage } from '@ionic/storage';
import { ViewChild } from '@angular/core';
import { Navbar } from 'ionic-angular';
import { LaunchPage } from '../launch/launch';
import { File } from '@ionic-native/file';
import { FileTransfer } from '@ionic-native/file-transfer';
import { DocumentViewer } from '@ionic-native/document-viewer';

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
  search_items: Array<{title: string, author: string, number : number, qtext : string, upvote : number, downvote : number, nid : string}>;

  userid:any;
  subject=this.navParams.get('subject');
  file_upload_event:any;
  title:string;
  summary:string;

  @ViewChild(Navbar) navBar: Navbar;

  constructor(public navCtrl: NavController, public navParams: NavParams,public http: Http,private alertCtrl: AlertController, public storage:Storage, private platform: Platform) {
    console.log("notes page starts here");
    this.search_items = [];
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
            title: data[i].title,
            author: data[i].upl_by,
            qtext : data[i].summary,
            //when: data[i].time,
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
    let postParams = {'upl_by':this.userid,'userid':this.userid,'subject':this.subject,'tag':this.subject,'course':'BTech','title':this.title,'summary':this.summary,'data':x,'islink':0}
     let headers = new Headers();
     headers.append('Content-Type','application/json');

         let path="http://127.0.0.1:5000/notes/upload"

         this.http.post(path, postParams, {headers: headers})
           .subscribe(res => {
             //let data = res.json();
             console.log(res)
             let alert = this.alertCtrl.create();
             alert.setTitle('Uploaded Notes Successfully');
             this.navCtrl.push(NotesPage, { subject : this.subject}
             );
           }, (err) => {
             console.log(err);

           });


  }
  onUploadChange(ev) {
    this.file_upload_event = ev;
  }
  uploadNotes() {
    let file = this.file_upload_event.target.files[0];
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
  search(ev){
    this.items = [];
    let postParams = {subject:this.subject, upl_by:this.userid}
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    let url = Enums.APIURL.URL1;
    let path = url.concat("/notes/list");
    console.log(postParams);

    this.http.post(path, postParams, {headers: headers})
      .subscribe(res => {
        console.log("this is res");
        console.log(res)
        let data = res.json()['notes'];
        console.log("this is data");
        console.log(data);
        let j = 0;
        for(let i in data) {
          this.items.push({
            nid:data[i]._id,
            number : data[i].upvotes,
            title: data[i].title,
            author: data[i].upl_by,
            qtext : data[i].summary,
            //when: data[i].time,
            upvote: data[i].upvotes,
            downvote: data[i].downvotes,
          });
          console.log('search');
          console.log(this.items);
        }
        console.log('out')
        console.log(this.items)
        console.log('val')
        console.log(ev.target.value)
        var val = ev.target.value
        if (val && val.trim() != '') {
          this.items = this.items.filter((item) => {
            console.log(item.qtext);
            console.log(val);
            console.log(item.qtext.toLowerCase().indexOf(val.toLowerCase()) > -1);
            return(item.qtext.toLowerCase().indexOf(val.toLowerCase()) > -1);
          })
        }
      }, (err) => {
             console.log(err);
      });
      console.log('out');
      console.log(this.search_items);
  }
  getItems(ev: any){
    console.log('going to search');
    this.search(ev);
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
  download(item){
    /*let path_download = null;
    let pdfUrl;
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
              pdfUrl = {pdfUrl: URL.createObjectURL(blob)};
              //this.navCtrl.push(ViewnotesPage, pdfUrl);
              console.log(pdfUrl);
              if(this.platform.is('ios')){
                path_download = this.file.documentsDirectory;
              }
              else{
                path_download = this.file.dataDirectory;
              }
              const transfer = this.transfer.create();
              transfer.download(pdfUrl, path + 'myFile.pdf').then(entry=> {
                let url = entry.toURL();
                //this.document.viewDocument(url, 'application/pdf', {});
              });

           }, (err) => {
             console.log(err);

           });*/
  }
  /*download() {
    const url = 'http://www.example.com/file.pdf';
    fileTransfer.download(url, this.file.dataDirectory + 'file.pdf').then((entry) => {
      console.log('download complete: ' + entry.toURL());
    }, (error) => {
      // handle error
    });
  }*/

  ionViewDidLoad() {
    console.log('ionViewDidLoad NotesPage');
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
  onCancel(ev){
    console.log('pressed cancel')
    return 0;
  }
}
