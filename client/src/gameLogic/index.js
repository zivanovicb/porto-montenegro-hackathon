import {
  Engine,
  ArcRotateCamera,
  HemisphericLight,
  Texture,
  StandardMaterial,
  Vector2,
  Vector3,
  Mesh,
  Scene,
  PhysicsImpostor,
  CannonJSPlugin,
  PolygonMeshBuilder,
  Color3,
} from '@babylonjs/core';
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader';
import { WaterMaterial } from '@babylonjs/materials';
import hexToRGB from 'hex-to-rgb';
import * as turf from '@turf/turf';

import "@babylonjs/core/Physics/physicsEngineComponent"
import "@babylonjs/loaders/OBJ";

import * as cannon from "cannon";
import * as earcut from "earcut";


import { generateInitalPlayer, checkInsideTerritory, mergeTerritoryWithPath } from './territoryHelpers';
import { playerPositions, playersData } from '../components/DesktopView';

const ASSETS_URL = "http://192.168.1.74:5000";
const FLOOR_SIZE = 4000

const modelsData = [
  { url: `${ASSETS_URL}/GG42B2PVJNLDKDUQTT4PBC2O5_obj/`, id: "GG42B2PVJNLDKDUQTT4PBC2O5.obj" },
  { url: `${ASSETS_URL}/LYG0RPJWBCKX33U4LG3KVY1OB_obj/`, id: "LYG0RPJWBCKX33U4LG3KVY1OB.obj" }, 
]

const playersFactory = () => Object.entries(playerPositions).reduce((acc, [playerID]) => ({
  ...acc,
  [playerID]: generateInitalPlayer()
}), {});

let players;

let ship;
let pirate;

export let shipPosition = {
  x: 0,
  z: 100
};

const init = async () => {
  players = playersFactory();

  const canvas = document.getElementById('game');
  const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
  
  const setupCamera = (scene) => {
    const camera = new ArcRotateCamera("Camera", 3 * Math.PI / 2, Math.PI / 3.7, 1000, new Vector3(0.0, 0.0, -100.0), scene);
    camera.attachControl(canvas, true);

    return camera;
  }

  const setupLight = (scene) => {
    const light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);

    return light;
  } 

  const setupWaterGround = (scene) => {
    const groundTexture = new Texture(`${ASSETS_URL}/kiKoLA5rT.jpg`, scene);
    groundTexture.vScale = groundTexture.uScale = 4.0;

    const groundMaterial = new StandardMaterial("groundMaterial", scene);
    groundMaterial.diffuseTexture = groundTexture;

    const ground = Mesh.CreateGround("ground", FLOOR_SIZE, FLOOR_SIZE, 32, scene, false);
    ground.position.y = -5;
    ground.material = groundMaterial;

    return ground;
  }

  const setupWater = (scene) => {
    var waterMaterial = new WaterMaterial("waterMaterial", scene, new Vector2(FLOOR_SIZE, FLOOR_SIZE));
    waterMaterial.bumpTexture = new Texture(`${ASSETS_URL}/waterbump.png`, scene);
    waterMaterial.windForce = -10;
    waterMaterial.waveHeight = 0.5;
    waterMaterial.bumpHeight = 0.1;
    waterMaterial.waveLength = 0.1;
    waterMaterial.waveSpeed = 50.0;
    waterMaterial.colorBlendFactor = 0;
    waterMaterial.windDirection = new Vector2(1, 1);
    waterMaterial.colorBlendFactor = 0;

    var waterMesh = Mesh.CreateGround("waterMesh", FLOOR_SIZE, FLOOR_SIZE, 32, scene, false);
    waterMesh.material = waterMaterial;

    waterMesh.physicsImpostor = new PhysicsImpostor(waterMesh, PhysicsImpostor.BoxImpostor, { mass: 0 }, scene);

    const waterGround = setupWaterGround(scene);

    waterMaterial.addToRenderList(waterGround);

    return waterMaterial;
  }

  const setupPlayerShips = (models, scene) =>
    Promise.all(
      Object.entries(players).map(([id, player]) =>
        new Promise((resolve) => {
          SceneLoader.ImportMesh(null, modelsData[0].url, modelsData[0].id, scene, (meshes) => {
            players[id].ship = meshes[0];

            players[id].ship.scaling = new Vector3(20.0, 20.0, 20.0);
            players[id].ship.position = new Vector3(player.position[0], 20.0, player.position[1]);
            players[id].ship.physicsImpostor = new PhysicsImpostor(players[id].ship, PhysicsImpostor.BoxImpostor, { mass: 1 }, scene);
            resolve();
          });
        })
      )
    );

  const drawTerritories = (scene) => {
    Object.entries(players).forEach(([id, player]) => {
      const points = Object.values(player.territory).map(([x, y]) => new Vector2(x, y));
      const polygon_triangulation = new PolygonMeshBuilder("name", points, scene, earcut);
      player.territoryPolygon = polygon_triangulation.build(true, 20);
      player.territoryPolygon.position.y = 5;
      const colorRGB = hexToRGB(playersData[id].color);
      const territoryMaterial = new StandardMaterial(scene);
      territoryMaterial.diffuseColor = new Color3(colorRGB[0] / 255, colorRGB[1] / 255, colorRGB[2] / 255);
      player.territoryPolygon.material = territoryMaterial;
    });
  }


  const createScene = async (engine) => {
    const scene = new Scene(engine);

    var gravityVector = new Vector3(0, -9.81, 0);
    var cannonPlugin = new CannonJSPlugin(true, 10, cannon);
    scene.enablePhysics(gravityVector, cannonPlugin);

    const camera = setupCamera(scene);
    const light = setupLight(scene);
    setupWater(scene);

    await setupPlayerShips(scene);
    drawTerritories(scene);

    return scene;
  };

  const scene = await createScene();
  // scene.debugLayer.show();

  const getYPos = () => Math.sin((new Date).getTime()) * 20;

  let yPos = getYPos();
  let wasPlayerInsideTerritory = {};
  let shouldPlayerLogPath = {};

  Object.entries(players).forEach(([id, player]) => {
    wasPlayerInsideTerritory[id] = true;
  });


  const updateShipPositions = () => {
    Object.entries(players).forEach(([id, player]) => {
      player.ship.physicsImpostor.setLinearVelocity(new Vector3(playerPositions[id].x * 5, 0, playerPositions[id].y * 5));
      player.ship.position.y = 20;
      player.ship.rotation = Vector3.Zero();
    });
  }

  const handleTerritoryLogic = () => {
    Object.entries(players).forEach(([id, player]) => {
      player.isInsideTerritory = checkInsideTerritory([player.ship.position.x, player.ship.position.z], player.territory);

      if (wasPlayerInsideTerritory[id] && !player.isInsideTerritory) {
        shouldPlayerLogPath[id] = true;
      }

      if (!wasPlayerInsideTerritory[id] && player.isInsideTerritory) {
        shouldPlayerLogPath[id] = false;
        const [first, ...rest] = player.currentPath;
        player.territory = turf.union(turf.polygon([player.territory]), turf.polygon([ [first, ...rest, first] ])).geometry.coordinates[0];
        player.currentPath = [];
        console.log(player.territory);
        drawTerritories();
      }

      if (shouldPlayerLogPath[id]) {
        player.currentPath.push([player.ship.position.x, player.ship.position.z]);
      }
    });
    
  }
  

  const handleWasPlayerInsideTerritory = () => {
    Object.entries(players).forEach(([id, player]) => {
      wasPlayerInsideTerritory[id] = player.isInsideTerritory;
    });
  }
  
  engine.runRenderLoop(() => {
    // yPos = (new Date).getTime() % 100 < 10 ? getYPos() : yPos;
    handleTerritoryLogic();

    updateShipPositions();

    scene.render();

    handleWasPlayerInsideTerritory();
  });

  window.addEventListener('resize', function(){
      engine.resize();
  });

}

export default init;