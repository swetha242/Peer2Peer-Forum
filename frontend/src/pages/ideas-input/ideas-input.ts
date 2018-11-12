import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FormBuilder, FormArray, FormGroup, Validators,FormControl} from '@angular/forms';
import { Http, Headers } from '@angular/http';

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

  public form 	: FormGroup;

  constructor(public navCtrl 		: NavController,public navParams 	: NavParams,private _FB : FormBuilder, public http: Http) {

    this.form = this._FB.group({
      title       	  : ['', Validators.required],
      description : [''],
      mentor_email: new FormControl('', Validators.compose([Validators.required,Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')])),
      link: [''],
      email: new FormControl('', Validators.compose([Validators.required,Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')])),
      links: this._FB.array([this.initLinks()]),
      colaborators: this._FB.array([this.initColab()])

   });
  }

  initLinks() : FormGroup
  {
   return this._FB.group({
      link : ['']
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

  manage(val : any) : void
  {
   console.dir(val);
  }


  ionViewDidLoad() {
    console.log('ionViewDidLoad IdeasInputPage');
  }

}
