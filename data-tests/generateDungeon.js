const dungeonGenerator = require('./2dDungeonGenerator.js');
const fs = require('fs');

const wallTypes = [29, 30, 31, 32, 33, 34, 35];
const floorTypes = [21, 22, 23, 24, 25, 26, 27];
const floorDecoTypes = [2, 3, 5, 11, 19];
const wallDecoTypes = [42, 43, 44, 45];
const placeableTypesLength = 25;



const layerToGenerate = 5;

const retour = {
  cells:[],
  placeables:[],
}

for(let z = 0; z < layerToGenerate; z++){
  const dungeon = dungeonGenerator({width:100,height:100});
  let flatDungeon = [];
  for(let y = 0; y < dungeon.length; y++){
    console.log(y, dungeon[y].length);
    flatDungeon = flatDungeon.concat(dungeon[y]);
  }
  retour.cells[z] = [];
  retour.placeables[z] = [];
  const correspondances = {};
  for(let y = 0; y < dungeon.length; y++){
    for(let x = 0; x < dungeon[y].length; x++){
      const cellValue = dungeon[y][x];
      if(cellValue !== 1){
        if(Math.random() < 0.2){
          retour.placeables[z].push({
            x:x+0.5,
            y:y+0.5,
            type: Math.floor(Math.random() * placeableTypesLength) + 1
          });
        }
      }
      let cellType = 0;
      if(Math.random() < 0.1){
        if(cellValue === 1){
          cellType = wallDecoTypes[Math.floor(Math.random() * wallDecoTypes.length)];
        }else{
          cellType = floorDecoTypes[Math.floor(Math.random() * floorDecoTypes.length)];
        }
      }else{
        if(correspondances[cellValue]){
          cellType = correspondances[cellValue];
        }else{
          if(cellValue === 1){
            cellType = wallTypes[Math.floor(Math.random() * wallTypes.length)];
            correspondances[cellValue] = cellType;
          }else{
            cellType = floorTypes[Math.floor(Math.random() * floorTypes.length)];
            correspondances[cellValue] = cellType;
          }
        }
      }
      retour.cells[z].push(cellType);
    }
  }
  console.log(flatDungeon.length, retour.cells[z].length);
}

console.log(retour.cells[0].length);

//write retour to file
fs.writeFile('map.json', JSON.stringify(retour), 'utf8', (err) => {
  if (err) throw err;
  console.log('The file has been saved!');
});


//console.log(retour);

