import { Component, OnInit } from '@angular/core';
import { NavController, AlertController, LoadingController, Loading, IonicPage } from 'ionic-angular';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthProvider } from '../../providers/auth/auth';
import { SubjectsPage } from '../subjects/subjects';
import { SignupPage } from '../signup/signup';
import { Http, Headers } from '@angular/http';
import { HelloIonicPage } from '../hello-ionic/hello-ionic';
import {LaunchPage} from '../launch/launch';

@IonicPage()
@Component({ 
  selector: 'page-login',
  templateUrl: 'login.html',
})

export class LoginPage implements OnInit {

    loading: Loading;
    email: string;
    password: string;
    loginform: FormGroup;
    constructor(public navCtrl: NavController, public authService: AuthProvider , public http: Http,private alertCtrl: AlertController, private loadingCtrl: LoadingController) {

    }

    ngOnInit() {
      let EMAILPATTERN = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/i;
      this.loginform = new FormGroup({
        //username: new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z ]*'), Validators.minLength(4), Validators.maxLength(10)]),
        password: new FormControl('', [Validators.required]),
        //name: new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z ]*'), Validators.minLength(4), Validators.maxLength(30)]),
        email: new FormControl('', [Validators.required, Validators.pattern(EMAILPATTERN)]),
      });
    }
    signup(){
      this.navCtrl.push(SignupPage)
    }
    home(){
      this.navCtrl.push(HelloIonicPage)
    }
  doLogin(){
    //if the username and password are valid
    //this.navCtrl.push(HelloIonicPage);

    let postParams = {email : this.email, password: this.password};


  //console.log(postParams);
  this.authService.login(postParams).then((result) => {

    let data = result["result"];
    //console.log(result)
    //console.log(JSON.parse(JSON.stringify(result)));
    if(data=="Success"){
      this.navCtrl.push(LaunchPage);
    }
    else if(data=="Invalid password"){
      //console.log("y");
      const alert = this.alertCtrl.create({
        title: 'Incorrect Password',
        subTitle: 'Password entered is incorrect!',
        buttons: ['OK']
      });
      alert.present();
    }
    else{
      const alert = this.alertCtrl.create({
        title: 'User not registered',
        subTitle: 'Please Signup',
        buttons: ['OK']
      });
      alert.present();
      this.navCtrl.push(SignupPage);
    }

  }, (err) => {
    console.log("yo");
    console.log(err);
    });

    }

    doSignup(){
      this.navCtrl.push(SignupPage);
    }
  }
