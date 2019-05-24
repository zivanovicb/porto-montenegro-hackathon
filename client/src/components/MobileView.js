import styled from 'styled-components';
import React, { useState } from 'react';
import io from 'socket.io-client';
import sillyname from 'sillyname';
import randomColor from 'randomcolor';
import SimpleSignalClient from 'simple-signal-client';
import { Joystick } from 'react-joystick-component';
import './overscroll-disable.css';

const Container = styled.div`
  background: ${props => props.background || 'white'};
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

Container.Joystick = styled.div`
  flex: 1;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const PlayerName = styled.span`
  color: white;
  font-size: 2em;
  font-family: 'Lato', sans-serif;
  font-weight: 900;

  padding-top: 1em;
`;

class MobileView extends React.Component {

  state = {
    roomID: "",
    isJoined: false,
    name: "",
    peer: {},
    socket: null,
    color: "",
  }

  componentDidMount = () => {
    window.addEventListener("beforeunload", (ev) => {
      ev.preventDefault();
      return this.doSomethingBeforeUnload();
  });
  }

  doSomethingBeforeUnload = () => {
    this.state.peer.destroy();
  }

  handleInputChange = (e) => this.setState({ roomID: e.target.value });

  handleJoin = () => {
    const { roomID } = this.state;

    const socket = io(process.env.REACT_APP_API_URL);

    const name = sillyname();
    const color = randomColor();

    this.setState({ isJoined: true, name, color, socket });

    const signalClient = new SimpleSignalClient(socket)

    signalClient.discover({ name });

    signalClient.on('discover', async (allIDs) => {
      const { peer } = await signalClient.connect(roomID, { name, color }) // connect to target client

      this.setState({ peer });

      // setTimeout(() => console.log(peer.destroy()), 2000);
    })
  }

  render() {
    const { isJoined, roomID, name } = this.state;

    if (isJoined) {
      const { peer, socket, color } = this.state;

      return (
        <Container background={color}>
          <PlayerName>{name}</PlayerName>


          <Container.Joystick>
            <Joystick
              size={100}
              baseColor="white"
              stickColor={color}
              move={(event) => peer.send && peer.send(JSON.stringify({ ...event, id: socket.id }))}
            />
          </Container.Joystick>
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