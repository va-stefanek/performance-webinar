import {Component, inject } from '@angular/core';

import {TutorialStore, Channel} from "./tutorial.store";

@Component({
  selector: 'app-example-components',
  templateUrl: './tutorial.component.html',
  styleUrls: ['./tutorial.component.css'],
  providers: [TutorialStore]
})
export class TutorialComponent {
  store = inject(TutorialStore);

  onSelected(event: Channel): void {
   this.store.setSelectedChannelName(event.name)
  }

  onReset(): void {
  }
}
