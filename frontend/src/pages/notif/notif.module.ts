import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NotifPage } from './notif';

@NgModule({
  declarations: [
    NotifPage,
  ],
  imports: [
    IonicPageModule.forChild(NotifPage),
  ],
})
export class NotifPageModule {}
