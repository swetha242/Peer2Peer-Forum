import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FormBuilder, FormArray, FormGroup, Validators,FormControl} from '@angular/forms';
import { Http, Headers } from '@angular/http';
import { IdeasProjectsPage } from '../ideas-projects/ideas-projects';
import { IdeasDetailsPage } from '../ideas-details/ideas-details';
import * as Enums from '../../assets/apiconfig';
import { Storage } from '@ionic/storage';

/**
 * Generated class for the IdeasInputPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-ideas-input',
  templateUrl: 'ideas-input.html',
})
export class IdeasInputPage {
  user_id: any;
  idea: Array<{user_id: string,title:string, description:string, summary:string, subject:string, tags:Array<"">, links:Array<"">, mentors:string, colaborators:Array<"">,max_colaborators:string}>;
  public form 	: FormGroup;

  constructor(public navCtrl 		: NavController,public navParams 	: NavParams,private _FB : FormBuilder, public http: Http,public storage: Storage) {
    this.idea = [];
    this.idea['links'] = [];
    this.idea['tags'] = [];
    this.idea['colaborators'] = [];
    this.storage.get('userid').then((uid)=>{
      this.user_id = uid
      console.log(this.user_id)
    })
    this.form = this._FB.group({
      title: ['', Validators.required],
      subject: ['',Validators.required],
      summary: ['',Validators.required],
      description: ['',Validators.required],
      value: [''],
      max_colaborators:[''],
      email: new FormControl('', Validators.compose([Validators.required,Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')])),
      links: this._FB.array([this.initLinks()]),
      colaborators: this._FB.array([this.initColab()]),
      tags: this._FB.array([this.initTags()])

   });
  }

  initLinks() : FormGroup
  {
   return this._FB.group({
      value: ['']
   });
  }

  addNewLink() : void
  {
   const control = <FormArray>this.form.controls.links;
   control.push(this.initLinks());
  }

  removeLink(i : number) : void
  {
   const control = <FormArray>this.form.controls.links;
   control.removeAt(i);
  }


  initColab() : FormGroup
  {
   return this._FB.group({
     email: new FormControl('', Validators.compose([Validators.required,Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')]))
   });
  }

  addNewColaborator() : void
  {
   const control = <FormArray>this.form.controls.colaborators;
   control.push(this.initColab());
  }

  removeColaborator(i : number) : void
  {
   const control = <FormArray>this.form.controls.colaborators;
   control.removeAt(i);
  }

  initTags() : FormGroup
  {
   return this._FB.group({
      value : ['']
   });
  }

  addNewTag() : void
  {
   const control = <FormArray>this.form.controls.tags;
   control.push(this.initLinks());
  }

  removeTag(i : number) : void
  {
   const control = <FormArray>this.form.controls.tags;
   control.removeAt(i);
  }

  manage(val : any) : void
  {
   console.dir(val);

   var i = 0;
   this.idea['user_id'] = this.user_id;
   this.idea['title'] = val.title;
   this.idea['subject'] = val.subject;
   this.idea['summary'] = val.summary;
   this.idea['description'] = val.description;
   this.idea['mentor_id'] = val.email;
   this.idea['max_colaborators'] = val.max_colaborators;

   for(let link of val.links){
     this.idea['links'].push(val.links[i].value);
     i = i + 1;
   }
   i = 0;
   for(let colab of val.colaborators){
     this.idea['colaborators'].push(val.colaborators[i].email);
     i = i + 1;
   }
   i=0;
   for(let tag of val.tags){
     this.idea['tags'].push(val.tags[i].value);
     i = i + 1;
   }
   console.log(this.idea);
   let post_Params = {title:this.idea['title'],links:this.idea['links'],subject:this.idea['subject'],
                      tags: this.idea['tags'],summary:this.idea['summary'],description:this.idea['description'],
                      max_colaborators:this.idea['max_colaborators'],owner_id:this.idea['user_id'],colaborator:this.idea['colaborators'],
                      mentor_id:this.idea['mentor_id']};
   let headers = new Headers();
   headers.append('Content-Type', 'application/json');

   let url = Enums.APIURL.URL1;
   let path = url.concat( "/ideas/insert");
   this.http.post(path, post_Params, {headers: headers})
    .subscribe(res => {
     console.log(res)
     this.navCtrl.push(IdeasProjectsPage)
   });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad IdeasInputPage');

  }

}
