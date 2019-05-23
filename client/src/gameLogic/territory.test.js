import { mergeTerritoryWithPath, generateInitialTerritory } from './territoryHelpers';

describe('territory', () => {
  it('should compute', () => {
    const player = {
      position: [2, 3],
      territory: [[1, 1], [2, 2], [2, 3], [1, 4]],
      currentPath: [[2, 2], [3, 1], [4, 1], [2, 3]],
    }

    expect(mergeTerritoryWithPath(player.territory, player.currentPath)).toStrictEqual([[1, 1], [2, 2], [3, 1], [4, 1], [2, 3], [1, 4]]);
  });

  it('should get init territory', () => {

    expect(generateInitialTerritory()).toBe(false);
  })
});