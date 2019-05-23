import styled from 'styled-components';
import React from 'react';
import io from 'socket.io-client';
import Game from '../Game';
import SimpleSignalClient from 'simple-signal-client';

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

Container.Players = styled.div``;

const RoomID = styled.span`
  color: royalblue;
  font-size: 36;
`;

export let playerPositions = [];

class DesktopView extends React.Component {
  state = {
    roomID: "",
    socket: null,
    gameStarted: false,
    players: [1, 2],
    positions: {}
  }

  componentDidMount = async () => {
    const socket = io(process.env.REACT_APP_API_URL);

    const rsp = await fetch(`${process.env.REACT_APP_API_URL}/roomID`);
    const { roomID } = await rsp.json()

    this.setState({ socket, roomID });

    
    socket.emit('join', { roomID });

    const signalClient = new SimpleSignalClient(socket)
    const componentThis = this;

    signalClient.discover();

    signalClient.on('request', async (request) => {
      const { peer } = await request.accept();

      peer.on('data', (data) => playerPositions[0] = JSON.parse(data) );
      console.log(peer);
    })
  }

  handleNewPlayer = (newPlayer) => this.setState((state) => ({ players: [...state.players, newPlayer] }))

  render() {
    const { gameStarted, roomID, players } = this.state;

    if (gameStarted) { 
      return (
        <Game />
      )
    }

    return (
      <Container>
        <RoomID>{roomID}</RoomID>
        
        <Container.Players>
          {players.map(player =>
            <div>{player}</div>
          )}
        </Container.Players>
        
        {players.length >= 2 && (
          <button onClick={() => this.setState({ gameStarted: true })}>START</button>
        )}
      </Container>
    );
  }
}

export default DesktopView;
