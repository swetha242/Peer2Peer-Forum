import { Component, OnInit } from '@angular/core';
import { NavController, AlertController, LoadingController, Loading, IonicPage } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import { LoginPage} from '../login/login';
import { LaunchPage } from '../launch/launch';
import { FormControl, FormGroup, Validators } from '@angular/forms';

/**
 * Generated class for the SignupPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html',
})
export class SignupPage implements OnInit {

  email:string;
  password:string;
  name: string ;
  signupform: FormGroup;
  constructor(public navCtrl: NavController, public authService: AuthProvider, public alertCtrl : AlertController ) {
  }
  ngOnInit() {
    let EMAILPATTERN = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/i;
    this.signupform = new FormGroup({
      //username: new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z ]*'), Validators.minLength(4), Validators.maxLength(10)]),
      password: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(12)]),
      name: new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z ]+'), Validators.minLength(4), Validators.maxLength(30)]),
      email: new FormControl('', [Validators.required, Validators.pattern(EMAILPATTERN)]),
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SignupPage');
  }

  doSignup(){
    let details = {email : this.email, password: this.password, username: this.name};


    this.authService.createAccount(details).then((result) => {

      let data = result["result"];
    //console.log(result)
    console.log(JSON.parse(JSON.stringify(result)));
    if(data=="Success"){
      const alert = this.alertCtrl.create({
        title: 'Successfully Registered',
        buttons: ['OK']
      });
      alert.present();
      this.navCtrl.push(LaunchPage);
    }
    }, (err) => {
      console.log(err)
    });

  }

  }
