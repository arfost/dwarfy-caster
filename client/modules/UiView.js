const randomTint = () => Math.floor(Math.random() * 256);

export class UiView {

  constructor(canvas) {
    // Création d'un canvas pour l'UI
    this.uiCanvas = document.createElement('canvas');
    this.width = this.uiCanvas.width = canvas.width;
    this.height = this.uiCanvas.height = canvas.height;
    this.uiCtx = this.uiCanvas.getContext('2d');

    // Propriétés pour l'UI
    this.fontSize = 14;
    this.uiCtx.font = `${this.fontSize}px Arial`;
    this.uiCtx.fillStyle = 'white';
    this.message = [];
  }

  render(player, map) {
    // Effacer le canvas de l'UI
    this.uiCtx.clearRect(0, 0, this.width, this.height);

    // Afficher la position du joueur
    this._drawText(`Position: (${player.x.toFixed(2)}, ${player.y.toFixed(2)}, ${player.z.toFixed(2)})`, this.width - 200, this.height - 20);

    // Dessiner une mini-carte
    this._drawMinimap(player, map);

    if(this.message) {
      const { isOverflowing, actualHeight } = this.drawTextBox(this.message.title, this.message.texts, this.message.options);

      console.log(`La boîte de texte dépasse : ${isOverflowing}`);
      console.log(`Hauteur réelle de la boîte : ${actualHeight}`);
    }
    
  }

  drawTextBox(title, texts, options = {}) {
    const {
      x = 50,
      y = 50,
      width = this.width - 100,
      maxHeight = this.height - 100,  // Nouvelle option pour la hauteur maximale
      backgroundColor = 'rgba(0, 0, 0, 0.7)',
      titleColor = 'white',
      textColor = 'white',
      titleFont = '18px Arial',
      textFont = '12px Arial',
      padding = 20,
      lineHeight = 1.5
    } = options;

    // Configurer les styles
    this.uiCtx.font = titleFont;
    const titleFontSize = parseInt(titleFont);
    this.uiCtx.font = textFont;
    const textFontSize = parseInt(textFont);
    const actualLineHeight = textFontSize * lineHeight;

    // Calculer la hauteur nécessaire
    let totalHeight = padding * 2 + titleFontSize + padding;
    let lines = [];
    texts.forEach(text => {
      const textLines = this.getLines(text, width - padding * 2);
      lines = lines.concat(textLines);
      totalHeight += textLines.length * actualLineHeight;
    });

    // Ajuster la hauteur si elle dépasse maxHeight
    const adjustedHeight = Math.min(totalHeight, maxHeight);
    const isOverflowing = totalHeight > maxHeight;

    // Dessiner le fond
    this.uiCtx.fillStyle = backgroundColor;
    this.uiCtx.fillRect(x, y, width, adjustedHeight);

    // Dessiner le titre
    this.uiCtx.fillStyle = titleColor;
    this.uiCtx.font = titleFont;
    const titleY = y + padding + titleFontSize;
    this.uiCtx.fillText(title, x + padding, titleY);

    // Dessiner les textes
    this.uiCtx.fillStyle = textColor;
    this.uiCtx.font = textFont;
    let currentY = titleY + padding;
    
    for (let i = 0; i < lines.length; i++) {
      if (currentY + textFontSize > y + adjustedHeight - padding) {
        // Si on dépasse, on arrête de dessiner et on ajoute "..."
        this.uiCtx.fillText("...", x + padding, currentY);
        break;
      }
      this.uiCtx.fillText(lines[i], x + padding, currentY);
      currentY += actualLineHeight;
    }

    return { isOverflowing, actualHeight: adjustedHeight };
  }

  getLines(text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = this.uiCtx.measureText(currentLine + " " + word).width;
      if (width < maxWidth) {
        currentLine += " " + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  }

  _drawText(text, x, y) {
    this.uiCtx.fillText(text, x, y);
  }

  _getFacingCellInfo(map, facingCell) {
    const cellType = map.getWall(facingCell.x, facingCell.y, facingCell.z);
    if (cellType > 0) {
      const cellProps = map.getCellProperties(cellType);
      if(cellProps.wallTexture) return `Wall (${facingCell.x}, ${facingCell.y}, ${facingCell.z}) - ${cellProps.wallTexture}`;
      return `Floor (${facingCell.x}, ${facingCell.y}, ${facingCell.z}) - ${cellProps.floorTexture}`;
    } else if (cellType === 0) {
      return `Empty (${facingCell.x}, ${facingCell.y}, ${facingCell.z})`;
    } else {
      return `Out of bounds (${facingCell.x}, ${facingCell.y}, ${facingCell.z})`;
    }
  }

  updateMessage(message) {
    this.message = message;
    this.dirty = true;
  }

  _drawMinimap(player, map) {
    const mapSize = 100;
    const cellSize = 5;
    const mapX = 10;
    const mapY = this.height - mapSize - 10;

    // Dessiner le fond de la mini-carte
    this.uiCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.uiCtx.fillRect(mapX, mapY, mapSize, mapSize);

    // Dessiner les murs
    for (let x = 0; x < mapSize / cellSize; x++) {
      for (let y = 0; y < mapSize / cellSize; y++) {
        const worldX = Math.floor(player.x) - Math.floor(mapSize / cellSize / 2) + x;
        const worldY = Math.floor(player.y) - Math.floor(mapSize / cellSize / 2) + y;
        const cellType = map.getWall(worldX, worldY, Math.floor(player.z));
        const cellProps = map.getCellProperties(cellType);
        if ( cellType > 0) {
          if(cellProps.wallTexture){
            this.uiCtx.fillStyle = `rgba(100, 100, 100, 0.5)`;
          } else if (cellProps.floorTexture) {
            this.uiCtx.fillStyle = 'rgba(255, 255, 255, 0.5)';
          }
          this.uiCtx.fillRect(mapX + x * cellSize, mapY + y * cellSize, cellSize, cellSize);
        }
      }
    }

    // Dessiner le joueur
    this.uiCtx.fillStyle = 'red';
    this.uiCtx.beginPath();
    this.uiCtx.arc(
      mapX + mapSize / 2,
      mapY + mapSize / 2,
      cellSize / 2,
      0,
      Math.PI * 2
    );
    this.uiCtx.fill();

    // Dessiner la direction du joueur
    this.uiCtx.strokeStyle = 'red';
    this.uiCtx.beginPath();
    this.uiCtx.moveTo(mapX + mapSize / 2, mapY + mapSize / 2);
    this.uiCtx.lineTo(
      mapX + mapSize / 2 + -player.dirX * cellSize * 2,
      mapY + mapSize / 2 + -player.dirY * cellSize * 2
    );
    this.uiCtx.stroke();
  }
}