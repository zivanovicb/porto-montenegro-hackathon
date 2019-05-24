import styled from 'styled-components';
import React from 'react';
import io from 'socket.io-client';
import Game from '../Game';
import SimpleSignalClient from 'simple-signal-client';
import { clamp } from 'lodash';
import produce from 'immer';

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(238deg, rgb(190, 16, 242), rgb(12, 196, 238)) 0% 0% / 400% 400%;
  animation: 7s ease 0s infinite normal none running Gradient;
`;

Container.Players = styled.div`
  display: grid;
  grid-template-columns: repeat(${props => clamp(props.playersCount, 1, 4)}, 1fr);
  justify-items: center;
  align-items: center;
  grid-column-gap: .69em;
  grid-row-gap: 1em;;
  background: white;
  border-radius: .33em;
  padding: .66em 1em;

  margin-bottom: 25px;
`;

const RoomID = styled.span`
  color: #ffffff;
  font-size: 120.19071999px;
  font-family: 'Lato', sans-serif;
  font-weight: 900;

  margin-bottom: 69px;
`;

const PlayerName = styled.span`
  color: black;
  font-size: 36px;
  font-family: 'Lato', sans-serif;
  font-weight: 400;
`;

const Button = styled.button`
  font-family: 'Lato', sans-serif;
  background: transparent;
  border: .05em solid white;
  color: white;
  font-size: 2.3em;
  font-weight: 300;
  padding: .1em .69em;
  border-radius: .33em;
`;

export let playerPositions = {};

export let playersData = { }// 'a': { name: 'Test Name1' }, 'b': { name: 'Test Name2' }, 'c': { name: 'Test Name1' }, 'd': { name: 'Test Name2' }, 'e': { name: 'Test Name2' } };

class DesktopView extends React.Component {
  state = {
    roomID: "",
    socket: null,
    gameStarted: false,
    playersData: playersData,
  }

  componentDidMount = async () => {
    const socket = io(process.env.REACT_APP_API_URL);

    const rsp = await fetch(`${process.env.REACT_APP_API_URL}/roomID`);
    const { roomID } = await rsp.json();
    this.setState({ socket, roomID });

    const signalClient = new SimpleSignalClient(socket)

    signalClient.discover({ roomID: roomID.toString() });

    signalClient.on('request', async (request) => {
      const { peer } = await request.accept();

      const playerData = {
        name: request.metadata.name,
        color: request.metadata.color,
      }

      playersData[request.initiator] = playerData;

      this.setState((state) => ({ playersData: { ...state.playersData, [request.initiator]: playerData } }))
      playerPositions[request.initiator] = { x: 0, y: 0 };

      peer.on('data', (data) => {
        const parsedData = JSON.parse(data);
        playerPositions[parsedData.id] = parsedData
      });

      peer.on('close', () => {
        this.setState(produce(draft => {
          delete draft.playersData[request.initiator]
        }))
      })
    })
  }

  handleNewPlayer = (newPlayer) => this.setState((state) => ({ players: [...state.players, newPlayer] }))

  render() {
    const { gameStarted, roomID, playersData } = this.state;

    if (gameStarted) { 
      return (
        <Game />
      )
    }

    const playersCount = Object.keys(playersData).length;

    return (
      <Container>
        <RoomID>{roomID}</RoomID>
        
        {playersCount > 0 && (
          <Container.Players playersCount={playersCount}>
            {Object.values(playersData).map(player =>
              <PlayerName>{player.name}</PlayerName>
            )}
          </Container.Players>
        )}
        
        {playersCount >= 2 && (
          <Button onClick={() => this.setState({ gameStarted: true })}>START</Button>
        )}
      </Container>
    );
  }
}

export default DesktopView;
