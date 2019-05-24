import isInsidePolygon from 'robust-point-in-polygon';
import * as turf from '@turf/turf';

const FLOAT_CMP_DELTA = 0.01;
const cmpPointFactory = (pt1, pt2) => Math.abs(pt1[0] - pt2[0]) < FLOAT_CMP_DELTA && Math.abs(pt1[1] - pt2[1]) < FLOAT_CMP_DELTA


const INIT_TERRITORY_RADIUS = 100;
const INIT_TERRITORY_POINT_NUM = 50;
const MAP_SIZE = 2000;

const boundedTerritoryCordGen = () => 
  Math.floor(Math.random() * ((MAP_SIZE - 2*INIT_TERRITORY_RADIUS) - 2*INIT_TERRITORY_RADIUS + 1) + 2*INIT_TERRITORY_RADIUS);

const getInitialCirclePoints = (numNodes, radius, position) => {
  const points = [...(Array(numNodes))].map((_, i) => {
    const angle = (i / (numNodes/2)) * Math.PI;
    const x = (radius * Math.cos(angle)) + position[0];
    const y = (radius * Math.sin(angle)) + position[1];
    return [x, y];
  });

  const [first, ...rest] = points;

  return [first, ...rest, first];
}

export const generateInitalPlayer = () => {
  const position = [ boundedTerritoryCordGen(), boundedTerritoryCordGen()];

  return ({
    isInsideTerritory: true,
    currentPath: [],
    territory: getInitialCirclePoints(INIT_TERRITORY_POINT_NUM, INIT_TERRITORY_RADIUS, position),
    position,
  });
}

export const shouldMergeWithPath = (isInsideTerritory, position, territory) => {
  if (isInsideTerritory) return true

  if (isInsidePolygon(territory, position) < 1) {
    return true
  }

  return false;
}

export const checkInsideTerritory = (pt, territory) =>
  turf.booleanPointInPolygon(turf.point(pt), turf.polygon([territory]));

export const mergeTerritoryWithPath = (territory, path) => {
  const pathStart = path[0];
  const pathEnd = path[path.length - 1];

  let terrStart, terrEnd;
  territory.forEach((terrPoint, i) => {
    if (cmpPointFactory(terrPoint, pathStart)) terrStart = i;

    if (cmpPointFactory(terrPoint, pathEnd)) terrEnd = i;
  });

  return [...territory.slice(0, terrStart), ...path, ...territory.slice(terrEnd+1)];;
}