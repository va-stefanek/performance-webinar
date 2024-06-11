import { Component, EventEmitter, Output, Input } from '@angular/core';

import { Channel } from './channel';
import {NgOptimizedImage} from "@angular/common";

@Component({
  selector: 'app-channel',
  templateUrl: './channel.component.html',
  styleUrls: ['./channel.component.css'],
  imports: [
    NgOptimizedImage
  ],
  standalone: true
})
export class ChannelComponent {

  @Input() channel: Channel;
  @Input() index: number;
  @Output() selected: EventEmitter<Channel> = new EventEmitter<Channel>();

  constructor() {
    this.channel = new Channel();
    this.index = 0;
  }

  select(channel: Channel): void {
    this.selected.emit(channel);
  }

}
