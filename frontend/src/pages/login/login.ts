import { Component } from '@angular/core';
import { NavController, AlertController, LoadingController, Loading, IonicPage } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import { SubjectsPage } from '../subjects/subjects';
import { SignupPage } from '../signup/signup';
import { Http, Headers } from '@angular/http';


@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})

export class LoginPage {

    loading: Loading; 
    email: string;
    password: string;
 
    constructor(public navCtrl: NavController, public authService: AuthProvider , public http: Http,private alertCtrl: AlertController, private loadingCtrl: LoadingController) {
 
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
      this.navCtrl.push(SubjectsPage,{ userid: result['user_id']});
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
  }

  



