import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FormBuilder, FormArray, FormGroup, Validators,FormControl} from '@angular/forms';
import { Http, Headers } from '@angular/http';
import { IdeasProjectsPage } from '../ideas-projects/ideas-projects';
import * as Enums from '../../assets/apiconfig';

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
  description: string;
  idea: Array<{user_id: string,title:string, description:string, summary:string, subject:string, tags:Array<"">, links:Array<"">, mentors:string, colaborators:Array<"">}>;
  public form 	: FormGroup;

  constructor(public navCtrl 		: NavController,public navParams 	: NavParams,private _FB : FormBuilder, public http: Http) {
    this.idea = [];
    this.form = this._FB.group({
      title: ['', Validators.required],
      value: [''],
      subject: ['',Validators.required],
      summary: ['',Validators.required],
      mentor_email: new FormControl('', Validators.compose([Validators.required,Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')])),
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

   let i = 0;

   this.idea['title'] = val.title;
   this.idea['subject'] = val.subject;
   this.idea['summary'] = val.summary.value;
   this.idea['description'] = this.description;
   this.idea['mentor'] = val.email;
   for(let link of val.links){
     this.idea['links'].push(val.links.i.value);
     i = i + 1;
   }
   i = 0;
   for(let colab of val.colaborators){
     this.idea['colaborators'].push(val.colaborators.i.email);
     i = i + 1;
   }
   i=0;
   for(let tag of val.tags){
     this.idea['tags'].push(val.tags.i.value);
   }

  }


  ionViewDidLoad() {
    console.log('ionViewDidLoad IdeasInputPage');

  }

}
