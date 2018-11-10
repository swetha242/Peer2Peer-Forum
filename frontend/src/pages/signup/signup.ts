import { Component } from '@angular/core';
import { NavController, AlertController, LoadingController, Loading, IonicPage } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import { LoginPage} from '../login/login';
import { SubjectsPage } from '../subjects/subjects';
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
export class SignupPage {

  email:string;
  password:string;
  name: string ;
  constructor(public navCtrl: NavController, public authService: AuthProvider, public alertCtrl : AlertController ) {
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
      this.navCtrl.push(SubjectsPage,{userid:result['user_id']});
    }
    }, (err) => {
      console.log(err)
    });
    
  }
    
  }


