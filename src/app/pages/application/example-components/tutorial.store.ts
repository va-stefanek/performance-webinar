import { signalStore, withComputed, withState} from "@ngrx/signals";
import {computed} from "@angular/core";
import {stringQueryParamConverter, withUrlParam} from "./with-url-param.feature";

export interface Channel {
  title: string;
  name: string;
  releaseDate: string;
}

export const TutorialStore = signalStore(
  withState({
    channels: [
      { title: 'Disney Channel', name: 'disney-channel', releaseDate: '22/03/1997' },
      { title: 'FOX', name: 'fox', releaseDate: '09/10/1986' },
      { title: 'Discovery Channel', name: 'discovery-channel', releaseDate: '17/06/1985' },
      { title: 'HBO', name: 'hbo', releaseDate: '08/11/1972' },
      { title: 'History', name: 'history', releaseDate: '01/01/1995' },
      { title: 'Hulu', name: 'hulu', releaseDate: '29/03/2007' },
      { title: 'MTV', name: 'mtv', releaseDate: '01/08/1981' },
      { title: 'NBC', name: 'nbc', releaseDate: '01/07/1941' },
      { title: 'Netflix', name: 'netflix', releaseDate: '29/08/1997' },
      { title: 'Showtime', name: 'showtime', releaseDate: '09/05/1976' },
      { title: 'USA Nnetwork', name: 'usa-network', releaseDate: '22/09/1977' },
    ],
    selectedChannelName: ''
  }),
  withUrlParam({
    selectedChannelName: {
      defaultValue: '',
      converter: stringQueryParamConverter
    }
  }),
  withComputed((store) => {
    return {
      selectedChannel: computed(() => {
        return store.channels().find(channel => channel.name === store.selectedChannelName())
      })
    }
  }),
)
