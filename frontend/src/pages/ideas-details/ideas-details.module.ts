import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { IdeasDetailsPage } from './ideas-details';

@NgModule({
  declarations: [
    IdeasDetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(IdeasDetailsPage),
  ],
})
export class IdeasDetailsPageModule {}
