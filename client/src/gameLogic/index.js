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
  Quaternion,
} from '@babylonjs/core';
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader';
import { WaterMaterial } from '@babylonjs/materials';

import { setupInput } from './processInput';

import "@babylonjs/core/Physics/physicsEngineComponent"
import "@babylonjs/loaders/OBJ";

import * as cannon from "cannon";
import { playerPositions } from '../components/DesktopView';

const modelsData = [
  { url: "http://192.168.43.43:5000/GG42B2PVJNLDKDUQTT4PBC2O5_obj/", id: "GG42B2PVJNLDKDUQTT4PBC2O5.obj" },
  { url: "http://192.168.43.43:5000/LYG0RPJWBCKX33U4LG3KVY1OB_obj/", id: "LYG0RPJWBCKX33U4LG3KVY1OB.obj" }, 
]

export let ship;
export let pirate;

export let shipPosition = {
  x: 0,
  z: 100
};

const FLOOR_SIZE = 2000

const init = async () => {
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
    const groundTexture = new Texture("http://192.168.43.43:5000/kiKoLA5rT.jpg", scene);
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
    waterMaterial.bumpTexture = new Texture("http://192.168.43.43:5000/waterbump.png", scene);
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

  const loadModels = (scene) =>
    Promise.all(modelsData.map(model => new Promise((resolve) =>
      SceneLoader.LoadAssetContainer(model.url, model.id, scene, resolve)
    )));

  const createScene = async (engine) => {
    const scene = new Scene(engine);

    const models = await loadModels();


    models.map((container) => container.addAllToScene());
    

    ship = models[0].meshes[0];
    pirate = models[1].meshes[0];

    var gravityVector = new Vector3(0, -9.81, 0);
    var cannonPlugin = new CannonJSPlugin(true, 10, cannon);
    scene.enablePhysics(gravityVector, cannonPlugin);

    ship.scaling = new Vector3(20.0, 20.0, 20.0);
    ship.position = new Vector3(0.0, 20.0, 0.0);
    ship.physicsImpostor = new PhysicsImpostor(ship, PhysicsImpostor.BoxImpostor, { mass: 1 }, scene);

    pirate.scaling = new Vector3(20.0, 20.0, 20.0);
    pirate.position = new Vector3(30.0, 15.0, 0.0);
    
    const camera = setupCamera(scene);
    const light = setupLight(scene);
    setupWater(scene);
    
    return scene;
  };

  const scene = await createScene();
  // scene.debugLayer.show();


  setupInput();

  const getYPos = () => Math.sin((new Date).getTime()) * 20;

  let yPos = getYPos();

  engine.runRenderLoop(() => {
    yPos = (new Date).getTime() % 100 < 7 ? getYPos() : yPos;
    console.log(yPos);
    ship.physicsImpostor.setLinearVelocity(new Vector3(playerPositions[0].x, yPos, playerPositions[0].y));
    ship.rotation = Vector3.Zero()

    scene.render();
  });

  window.addEventListener('resize', function(){
      engine.resize();
  });

}

export default init;