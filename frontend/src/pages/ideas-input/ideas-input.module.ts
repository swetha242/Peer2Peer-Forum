import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { IdeasInputPage } from './ideas-input';

@NgModule({
  declarations: [
    IdeasInputPage,
  ],
  imports: [
    IonicPageModule.forChild(IdeasInputPage),
  ],
})
export class IdeasInputPageModule {}
