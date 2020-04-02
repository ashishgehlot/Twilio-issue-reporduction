import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { connect, createLocalVideoTrack } from 'twilio-video';
import { ViewEncapsulation } from '@angular/compiler/src/compiler_facade_interface';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {

  constructor(private activatedRoute: ActivatedRoute) { }

  token: string;

  ngOnInit(): void {

    createLocalVideoTrack().then(track => {
      const localMediaContainer = document.getElementById('caller');
      localMediaContainer.appendChild(track.attach());
    });
  }

  ConnectToRoom() {
    console.log(this.token);
    connect(this.token, { name: 'my-new-room', logLevel: "debug" }).then(room => {
      // Log your Client's LocalParticipant in the Room
      const localParticipant = room.localParticipant;
      console.log(`Connected to the Room as LocalParticipant "${localParticipant.identity}"`);

      // Handle any Participants already connected to the Room
      room.participants.forEach(participantConnected);

      // Handle any Participants that will join the Room in the future.
      room.on('participantConnected', participantConnected);

      room.on('participantDisconnected', participant => {
      });

      room.on('disconnected', () => {
        // Detach the local media elements
        room.localParticipant.tracks.forEach(publication => {
          const attachedElements = publication.track.detach();
          attachedElements.forEach(element => element.remove());
        });
      });

    }, error => {
      console.error(`Unable to connect to Room: ${error.message}`);
    });

  }

}

function trackSubscribed(track) {
  console.log('Subscribed to RemoteTrack:', track);
  document.getElementById('callee').appendChild(track.attach());
}

function participantConnected(participant) {
  console.log(`Participant "${participant.identity}" is connected to the Room`);

  // Handle Tracks that are already subscribed.
  participant.tracks.forEach(publication => {
    if (publication.isSubscribed) {
      trackSubscribed(publication.track);
    }
  });

  // Handle Tracks that are subscribed in the future.
  participant.on('trackSubscribed', trackSubscribed);
}
