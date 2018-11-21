import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RecoNotesPage } from './reco-notes';

@NgModule({
  declarations: [
    RecoNotesPage,
  ],
  imports: [
    IonicPageModule.forChild(RecoNotesPage),
  ],
})
export class RecoNotesPageModule {}
