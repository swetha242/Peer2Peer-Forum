import { Component, OnInit } from '@angular/core';
import { NavController, AlertController, LoadingController, Loading, IonicPage } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import { LoginPage} from '../login/login';
import { LaunchPage } from '../launch/launch';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as Enums from '../../assets/apiconfig';
import { Http, Headers } from '@angular/http';
import { HelloIonicPage } from '../hello-ionic/hello-ionic';
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
  constructor(public http:Http,public navCtrl: NavController, public authService: AuthProvider, public alertCtrl : AlertController ) {
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
    let details = {email : this.email};
    //first check if already user exists
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

        let url = Enums.APIURL.URL1;
        let path = url.concat( "/v1/checkuser");

        this.http.post(path, {email:details.email}, {headers: headers})
          .subscribe(res => {
           console.log(res)
            let data = res.json()['result'];
            if(data=='Already registered'){
              const alert = this.alertCtrl.create({
                title: 'Already a user',
                buttons: ['OK']
              });
              alert.present();
              this.navCtrl.push(LoginPage)
            }
            else
            {
              this.verify_otp()
            }
          
  });
}
login()
{
  this.navCtrl.push(LoginPage);
}
home()
{
  this.navCtrl.push(HelloIonicPage);
}
verify_otp()
{
  let details = {email : this.email};
    //first check if already user exists
  let headers = new Headers();
  let url = Enums.APIURL.URL1;
  let path = url.concat( "/otp/send");

    this.http.post(path,details, {headers: headers})
     .subscribe(res => {
     console.log(res)
     let data = res.json()['result'];
    if(data=='Success'){
    let self=this
    let alert = this.alertCtrl.create({
      title: 'An OTP has been sent to your mail',
      message:'Enter OTP',
      inputs: [
        {
          name: 'otp'
        }
       
      ],
      buttons:[
        {
          text: 'Cancel',
          role: 'cancel',
          
        },
        {
          text: 'Submit',
          handler: data => {
            console.log(data);
            let postParams = {otp : data['otp']}
            console.log(postParams);
            let headers = new Headers();
            headers.append('Content-Type', 'application/json');

              let url = Enums.APIURL.URL1;
              let path = url.concat( "/otp/verify");
              
              this.http.post(path, postParams, {headers: headers})
                .subscribe(res => {
                  data=res.json()['result']
                  console.log(data)
                  if(data=='Success'){

                    let details={username:this.name,password:this.password,email:this.email}
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
                    else
                    {
                      const alert = this.alertCtrl.create({
                        title: 'Invalid OTP',
                        buttons: ['OK']
                      });
                      alert.present();
                    }
                    
                    }, (err) => {
                      console.log(err)
                    });
                  }


                }, (err) => {
                  console.log(err);
                  //reject(err);
                });
                //this.navCtrl.push(ItemDetailsPage,{item:this.selectedItem,answer:this.answers,userid:this.userid});
                }
              }
            ]
          });
          alert.present();
                  }
                
        });
      }

   
    

  }

  
