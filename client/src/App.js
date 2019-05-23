import { Engine, Scene, FreeCamera, HemisphericLight, Sphere, Ground } from 'react-babylonjs'
import React, { Component, Fragment } from 'react'
import { Vector3 } from 'babylonjs';

import './App.css';
class DefaultPlayground extends Component {
  constructor(props) {
    super(props);
    this.state = {
      player: {
        position: {
          x: 0,
          y: 1
        },
        path: []
      }
    };
  }

  handleKeyDown = e => {
    // left: 37, up: 38, right: 39, down: 40
    switch (e.keyCode) {
      // left
      case 37:
        this.setState(prevState => ({
          ...prevState,
          player: {
            ...prevState,
            position: {
              x: prevState.player.position.x - 0.05,
              y: prevState.player.position.y
            }
          }
        }))
        break;
      // up
      case 38:
        this.setState(prevState => ({
          ...prevState,
          player: {
            ...prevState,
            position: {
              x: prevState.player.position.x,
              y: prevState.player.position.y + 1
            }
          }
        }))
        break;
      // right
      case 39:
        this.setState(prevState => ({
          ...prevState,
          player: {
            ...prevState,
            position: {
              x: prevState.player.position.x + 1,
              y: prevState.player.position.y
            }
          }
        }))
        break;
      // down
      case 40:
        this.setState(prevState => ({
          ...prevState,
          player: {
            ...prevState,
            position: {
              x: prevState.player.position.x,
              y: prevState.player.position.y - 1
            }
          }
        }))
        break;

      default:
        break;
    }
  }

  changePointPosition({ x, y }) {
    this.setState(prevState => ({
      ...prevState,
      player: {
        ...prevState,
        position: {
          x: prevState.player.position.x,
          y: prevState.player.position.y - 1
        }
      }
    }))
  }


  componentDidMount() {
    window.addEventListener('keydown', this.handleKeyDown);
    setInterval(() => {
      console.log("tick")
      this.setState(prevState => ({
        ...prevState,
        player: {
          ...prevState.player,
          position: {
            x: prevState.player.position.x + 0.1,
            y: prevState.player.position.y
          }
        }
      }))
    }, 200)

  }

  render() {
    return (
      <div className="demo" >
        <Engine antialias={true} adaptToDeviceRatio={true} canvasId="sample-canvas">
          <Scene>
            <FreeCamera name="camera1" position={new Vector3(0, 90, 10)} setTarget={[Vector3.Zero(), Vector3.One()]} />
            <HemisphericLight name="light1" intensity={0.7} direction={Vector3.Up()} />
            <Sphere name="sphere1" diameter={2} segments={16} position={new Vector3(this.state.player.position.x, this.state.player.position.y, 0)} />
            <Ground name="ground1" width={60} height={60} subdivisions={2} />
          </Scene>
        </Engine>
      </div>
    )
  }
}

export default DefaultPlayground