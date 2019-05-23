import styled from 'styled-components';
import React, { useState } from 'react';
import io from 'socket.io-client';
import sillyname from 'sillyname';
import SimpleSignalClient from 'simple-signal-client';
import { Joystick } from 'react-joystick-component';
import './overscroll-disable.css';

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

class MobileView extends React.Component {

  state = {
    roomID: "",
    isJoined: false,
    name: "",
    peer: {},
  }

  handleInputChange = (e) => this.setState({ roomID: e.target.value });

  handleJoin = () => {
    const { roomID } = this.state;

    const socket = io(process.env.REACT_APP_API_URL);

    const name = sillyname();

    socket.emit('join', { roomID, name });

    this.setState({ isJoined: true, name });

    const signalClient = new SimpleSignalClient(socket)

    signalClient.discover();

    signalClient.on('discover', async (allIDs) => {
      const idKey = prompt(JSON.stringify(allIDs));
      const id = allIDs[idKey] // Have the user choose an ID to connect to
      const { peer } = await signalClient.connect(id) // connect to target client
      peer.on('data', console.log);
      console.log(peer);
      this.setState({ peer });
    })
  }

  render() {
    const { isJoined, roomID, name } = this.state;

    if (isJoined) {
      const { peer } = this.state;
      console.log(peer);

      return (
        <Container>
          {name} JOINED!

          <Joystick
            size={100}
            baseColor="red"
            stickColor="blue"
            move={(event) => peer.send && peer.send(JSON.stringify(event))}
        />
        </Container>
      );
    }

    return (
      <Container>
        <input value={roomID} onChange={this.handleInputChange} />
        <button onClick={this.handleJoin}>JOIN</button>
      </Container>
    );
    };
}

export default MobileView;