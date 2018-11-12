import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { IdeasProjectsPage } from './ideas-projects';

@NgModule({
  declarations: [
    IdeasProjectsPage,
  ],
  imports: [
    IonicPageModule.forChild(IdeasProjectsPage),
  ],
})
export class IdeasProjectsPageModule {}
