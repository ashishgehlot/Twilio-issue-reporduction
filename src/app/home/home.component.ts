import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { connect, createLocalVideoTrack } from 'twilio-video';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {

    const token = this.activatedRoute.snapshot.queryParamMap.get('TOKEN');
    console.log(token);

    connect(token, { name: 'my-new-room' }).then(room => {
      // Log your Client's LocalParticipant in the Room
      const localParticipant = room.localParticipant;
      console.log(`Connected to the Room as LocalParticipant "${localParticipant.identity}"`);

      // Log any Participants already connected to the Room
      room.participants.forEach(participant => {
        console.log(`Participant "${participant.identity}" is connected to the Room`);
      });

      room.on('participantConnected', participant => {

        participant.tracks.forEach(publication => {
          if (publication.isSubscribed) {
            const track = publication.track;
            console.log(track);
            document.getElementById('callee').appendChild(track.attach());
          }
        });

        participant.on('trackSubscribed', track => {
            console.log(track);
            document.getElementById('callee').appendChild(track.attach());
        });


      });

      room.on('participantDisconnected', participant => {
      });

      room.on('disconnected', room => {
        // Detach the local media elements
        room.localParticipant.tracks.forEach(publication => {
          const attachedElements = publication.track.detach();
          attachedElements.forEach(element => element.remove());
        });
      });

    }, error => {
      console.error(`Unable to connect to Room: ${error.message}`);
    });

    createLocalVideoTrack().then(track => {
      const localMediaContainer = document.getElementById('caller');
      localMediaContainer.appendChild(track.attach());
    });
  }

}
