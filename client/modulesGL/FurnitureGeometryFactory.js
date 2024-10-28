export class FurnitureGeometryFactory {

  static getGeometry(type, geometry) {
    switch (type) {
      case "BED":
        return this.getBedGeometry(geometry);
      case "BOX":
        return this.getChestGeometry(geometry);
      case "TABLE":
        return this.getTableGeometry(geometry);
      case "CHAIR":
        return this.getChairGeometry(geometry);
      case "STATUE":
        return this.getStatueGeometry(geometry);
      case "CABINET":
        return this.getShelfGeometry(geometry);
      case "COFFIN":
        return this.getSarcophagusGeometry(geometry);
      case "BARREL":
        return this.getBarrelGeometry(geometry);
      case "BIN":
        return this.getBinGeometry(geometry);
      case "WEAPONRACK":
        return this.getWeaponRackGeometry(geometry);
      case "ARMORSTAND":
        return this.getArmorStandGeometry(geometry);
      case "CAGE":
        return this.getCageGeometry(geometry);
      case "TRAP/CAGETRAP":
        return this.getCageTrapGeometry(geometry);
      case "ARCHERYTARGET":
        return this.getArcheryTargetGeometry(geometry);
      default:
        return geometry;
    }
  }

  static _addQuad(geometry, p1, p2, p3, p4, uvRect) {
    geometry.positions.push(...p1, ...p2, ...p3, ...p4);

    geometry.textureCoordinates.push(
      uvRect.x, uvRect.y + uvRect.height,                    // Bas gauche
      uvRect.x + uvRect.width, uvRect.y + uvRect.height,     // Bas droite
      uvRect.x + uvRect.width, uvRect.y,                     // Haut droite
      uvRect.x, uvRect.y                                     // Haut gauche
    );

    geometry.indices.push(
      geometry.vertexCount, geometry.vertexCount + 1, geometry.vertexCount + 2,
      geometry.vertexCount, geometry.vertexCount + 2, geometry.vertexCount + 3
    );
    geometry.vertexCount += 4;
  };

  static getArcheryTargetGeometry(geometry) {
    const uvMap = {
      target: {
        x: 0,
        y: 0,
        width: 192 / 256,
        height: 192 / 256
      },
      wood: {
        x: 192 / 256,
        y: 0,
        width: 64 / 256,
        height: 128 / 256
      },
      stand: {
        x: 0,
        y: 192 / 256,
        width: 192 / 256,
        height: 64 / 256
      }
    };

    // Dimensions de la cible
    const width = 0.7;          // Largeur de la cible
    const depth = 0.1;          // Épaisseur de la cible
    const legWidth = 0.05;      // Largeur des pieds
    const targetAngle = Math.PI/6;  // Angle d'inclinaison de la cible (30 degrés)
    
    // Dimensions du support
    const standDepth = depth * 3;
    const standHeight = 0.7;    // Hauteur des pieds arrière
    const frontLegHeight = standHeight * 0.3;  // Hauteur des pieds avant

    // La cible elle-même devrait être un peu plus petite que la largeur totale
    const targetWidth = width * 0.8;
    const targetHeight = targetWidth; // Pour garder la cible circulaire

    // Décalages pour centrer
    const offsetX = -width/2;
    const offsetY = -depth/2;

    // Calculs pour l'inclinaison
    const depthTilt = Math.cos(targetAngle) * depth;
    const heightTilt = Math.sin(targetAngle) * depth;

    // Position de base de la cible : elle doit reposer sur le support
    const targetBaseHeight = frontLegHeight; // La cible commence au niveau des pieds avant

    // Surface de la cible
    // Face avant (cible)
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX, offsetY, targetBaseHeight ],
      [offsetX + width, offsetY, targetBaseHeight],
      [offsetX + width, offsetY+standDepth, standHeight],
      [offsetX, offsetY+standDepth, standHeight],
      uvMap.target
    );
    // Face arrière (décalée vers le haut et l'arrière)
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX, offsetY + 0.02, targetBaseHeight ],
      [offsetX + width, offsetY + 0.02, targetBaseHeight],
      [offsetX + width, offsetY+standDepth + 0.02, standHeight],
      [offsetX, offsetY+standDepth + 0.02, standHeight],
      uvMap.wood
    );

    // Côtés de la cible
    // Gauche
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX, offsetY, targetBaseHeight],
      [offsetX, offsetY+ 0.02, targetBaseHeight],
      [offsetX, offsetY+standDepth, standHeight],
      [offsetX, offsetY+standDepth+ 0.02, standHeight],
      uvMap.wood
    );

    // Droite
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX + width, offsetY, targetBaseHeight],
      [offsetX + width, offsetY+ 0.02, targetBaseHeight],
      [offsetX + width, offsetY+standDepth, standHeight],
      [offsetX + width, offsetY+standDepth+ 0.02, standHeight],
      uvMap.wood
    );

    // Jambe arrière gauche
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX + width * 0.2, offsetY + standDepth, 0],
      [offsetX + width * 0.2 + legWidth, offsetY + standDepth, 0],
      [offsetX + width * 0.2 + legWidth, offsetY + standDepth, standHeight],
      [offsetX + width * 0.2, offsetY + standDepth, standHeight],
      uvMap.stand
    );

    // Jambe arrière droite
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX + width * 0.8 - legWidth, offsetY + standDepth, 0],
      [offsetX + width * 0.8, offsetY + standDepth, 0],
      [offsetX + width * 0.8, offsetY + standDepth, standHeight],
      [offsetX + width * 0.8 - legWidth, offsetY + standDepth, standHeight],
      uvMap.stand
    );

    // Support horizontal entre les jambes arrière
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX + width * 0.2, offsetY + standDepth, standHeight * 0.6],
      [offsetX + width * 0.8, offsetY + standDepth, standHeight * 0.6],
      [offsetX + width * 0.8, offsetY + standDepth, standHeight * 0.6 + legWidth],
      [offsetX + width * 0.2, offsetY + standDepth, standHeight * 0.6 + legWidth],
      uvMap.stand
    );

    // Jambe avant gauche
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX + width * 0.2, offsetY, 0],
      [offsetX + width * 0.2 + legWidth, offsetY, 0],
      [offsetX + width * 0.2 + legWidth, offsetY, frontLegHeight],
      [offsetX + width * 0.2, offsetY, frontLegHeight],
      uvMap.stand
    );

    // Jambe avant droite
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX + width * 0.8 - legWidth, offsetY, 0],
      [offsetX + width * 0.8, offsetY, 0],
      [offsetX + width * 0.8, offsetY, frontLegHeight],
      [offsetX + width * 0.8 - legWidth, offsetY, frontLegHeight],
      uvMap.stand
    );

    return geometry;
  }

  static getCageTrapGeometry(geometry) {
    const uvMap = {
      metal: {
        x: 0,
        y: 0,
        width: 192 / 256,
        height: 128 / 256
      },
      bars: {
        x: 192 / 256,
        y: 0,
        width: 64 / 256,
        height: 192 / 256
      },
      base: {
        x: 0,
        y: 128 / 256,
        width: 128 / 256,
        height: 128 / 256
      }
    };

    // Dimensions de la cage
    const width = 0.6;          // Largeur totale
    const height = 0.6;         // Hauteur totale
    const barWidth = 0.03;      // Épaisseur des barreaux
    const baseHeight = 0.05;    // Hauteur de la base
    const numBars = 8;          // Nombre de barreaux sur chaque côté

    // Décalages pour centrer
    const offsetX = -width / 2;
    const offsetY = -width / 2;

    // Barreaux verticaux
    const spacing = width / (numBars - 1);

    // Face avant et arrière
    for (let i = 0; i < numBars; i++) {
      const x = offsetX + i * spacing;

      // Barreau avant
      FurnitureGeometryFactory._addQuad(
        geometry,
        [x - barWidth / 2, offsetY, 1 - height],
        [x + barWidth / 2, offsetY, 1 - height],
        [x + barWidth / 2, offsetY, 1 - baseHeight],
        [x - barWidth / 2, offsetY, 1 - baseHeight],
        uvMap.bars
      );

      // Barreau arrière
      FurnitureGeometryFactory._addQuad(
        geometry,
        [x - barWidth / 2, offsetY + width, 1 - height],
        [x + barWidth / 2, offsetY + width, 1 - height],
        [x + barWidth / 2, offsetY + width, 1 - baseHeight],
        [x - barWidth / 2, offsetY + width, 1 - baseHeight],
        uvMap.bars
      );
    }

    // Barreaux latéraux
    for (let i = 0; i < numBars; i++) {
      const y = offsetY + i * spacing;

      // Barreau gauche
      FurnitureGeometryFactory._addQuad(
        geometry,
        [offsetX, y - barWidth / 2, 1 - height],
        [offsetX, y + barWidth / 2, 1 - height],
        [offsetX, y + barWidth / 2, 1 - baseHeight],
        [offsetX, y - barWidth / 2, 1 - baseHeight],
        uvMap.bars
      );

      // Barreau droit
      FurnitureGeometryFactory._addQuad(
        geometry,
        [offsetX + width, y - barWidth / 2, 1 - height],
        [offsetX + width, y + barWidth / 2, 1 - height],
        [offsetX + width, y + barWidth / 2, 1 - baseHeight],
        [offsetX + width, y - barWidth / 2, 1 - baseHeight],
        uvMap.bars
      );
    }

    // Cadre horizontal supérieur
    // Avant
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX, offsetY, 1 - baseHeight],
      [offsetX + width, offsetY, 1 - baseHeight],
      [offsetX + width, offsetY, 1],
      [offsetX, offsetY, 1],
      uvMap.metal
    );

    // Arrière
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX, offsetY + width, 1 - baseHeight],
      [offsetX + width, offsetY + width, 1 - baseHeight],
      [offsetX + width, offsetY + width, 1],
      [offsetX, offsetY + width, 1],
      uvMap.metal
    );

    // Gauche
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX, offsetY, 1 - baseHeight],
      [offsetX, offsetY + width, 1 - baseHeight],
      [offsetX, offsetY + width, 1],
      [offsetX, offsetY, 1],
      uvMap.metal
    );

    // Droite
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX + width, offsetY, 1 - baseHeight],
      [offsetX + width, offsetY + width, 1 - baseHeight],
      [offsetX + width, offsetY + width, 1],
      [offsetX + width, offsetY, 1],
      uvMap.metal
    );

    //dessous du cadre
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX, offsetY, 1 - baseHeight],
      [offsetX + width, offsetY, 1 - baseHeight],
      [offsetX + width, offsetY + width, 1 - baseHeight],
      [offsetX, offsetY + width, 1 - baseHeight],
      uvMap.metal
    );

    return geometry;
  }

  static getCageGeometry(geometry) {
    const uvMap = {
      metal: {
        x: 0,
        y: 0,
        width: 192 / 256,
        height: 128 / 256
      },
      bars: {
        x: 192 / 256,
        y: 0,
        width: 64 / 256,
        height: 192 / 256
      },
      base: {
        x: 0,
        y: 128 / 256,
        width: 128 / 256,
        height: 128 / 256
      }
    };

    // Dimensions de la cage
    const width = 0.6;          // Largeur totale
    const height = 0.6;         // Hauteur totale
    const barWidth = 0.03;      // Épaisseur des barreaux
    const baseHeight = 0.05;    // Hauteur de la base
    const numBars = 8;          // Nombre de barreaux sur chaque côté

    // Décalages pour centrer
    const offsetX = -width / 2;
    const offsetY = -width / 2;

    // Base solide
    // Face supérieure
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX, offsetY, baseHeight],
      [offsetX + width, offsetY, baseHeight],
      [offsetX + width, offsetY + width, baseHeight],
      [offsetX, offsetY + width, baseHeight],
      uvMap.base
    );

    // Face avant de la base
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX, offsetY, 0],
      [offsetX + width, offsetY, 0],
      [offsetX + width, offsetY, baseHeight],
      [offsetX, offsetY, baseHeight],
      uvMap.base
    );

    // Face arrière de la base  
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX, offsetY + width, 0],
      [offsetX + width, offsetY + width, 0],
      [offsetX + width, offsetY + width, baseHeight],
      [offsetX, offsetY + width, baseHeight],
      uvMap.base
    );
    // Face gauche de la base
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX, offsetY, 0],
      [offsetX, offsetY + width, 0],
      [offsetX, offsetY + width, baseHeight],
      [offsetX, offsetY, baseHeight],
      uvMap.base
    );
    // Face droite de la base
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX + width, offsetY, 0],
      [offsetX + width, offsetY + width, 0],
      [offsetX + width, offsetY + width, baseHeight],
      [offsetX + width, offsetY, baseHeight],
      uvMap.base
    );

    // Barreaux verticaux
    const spacing = width / (numBars - 1);

    // Face avant et arrière
    for (let i = 0; i < numBars; i++) {
      const x = offsetX + i * spacing;

      // Barreau avant
      FurnitureGeometryFactory._addQuad(
        geometry,
        [x - barWidth / 2, offsetY, baseHeight],
        [x + barWidth / 2, offsetY, baseHeight],
        [x + barWidth / 2, offsetY, height],
        [x - barWidth / 2, offsetY, height],
        uvMap.bars
      );

      // Barreau arrière
      FurnitureGeometryFactory._addQuad(
        geometry,
        [x - barWidth / 2, offsetY + width, baseHeight],
        [x + barWidth / 2, offsetY + width, baseHeight],
        [x + barWidth / 2, offsetY + width, height],
        [x - barWidth / 2, offsetY + width, height],
        uvMap.bars
      );
    }

    // Barreaux latéraux
    for (let i = 0; i < numBars; i++) {
      const y = offsetY + i * spacing;

      // Barreau gauche
      FurnitureGeometryFactory._addQuad(
        geometry,
        [offsetX, y - barWidth / 2, baseHeight],
        [offsetX, y + barWidth / 2, baseHeight],
        [offsetX, y + barWidth / 2, height],
        [offsetX, y - barWidth / 2, height],
        uvMap.bars
      );

      // Barreau droit
      FurnitureGeometryFactory._addQuad(
        geometry,
        [offsetX + width, y - barWidth / 2, baseHeight],
        [offsetX + width, y + barWidth / 2, baseHeight],
        [offsetX + width, y + barWidth / 2, height],
        [offsetX + width, y - barWidth / 2, height],
        uvMap.bars
      );
    }

    // Cadre horizontal supérieur
    // Avant
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX, offsetY, height - barWidth],
      [offsetX + width, offsetY, height - barWidth],
      [offsetX + width, offsetY, height],
      [offsetX, offsetY, height],
      uvMap.metal
    );

    // Arrière
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX, offsetY + width, height - barWidth],
      [offsetX + width, offsetY + width, height - barWidth],
      [offsetX + width, offsetY + width, height],
      [offsetX, offsetY + width, height],
      uvMap.metal
    );

    // Gauche
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX, offsetY, height - barWidth],
      [offsetX, offsetY + width, height - barWidth],
      [offsetX, offsetY + width, height],
      [offsetX, offsetY, height],
      uvMap.metal
    );

    // Droite
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX + width, offsetY, height - barWidth],
      [offsetX + width, offsetY + width, height - barWidth],
      [offsetX + width, offsetY + width, height],
      [offsetX + width, offsetY, height],
      uvMap.metal
    );

    // Dessus du cadre
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX, offsetY, height],
      [offsetX + width, offsetY, height],
      [offsetX + width, offsetY + width, height],
      [offsetX, offsetY + width, height],
      uvMap.metal
    );

    return geometry;
  }

  static getArmorStandGeometry(geometry) {
    const uvMap = {
      wood: {
        x: 0,
        y: 0,
        width: 128 / 256,
        height: 64 / 256
      },
      metal: {
        x: 128 / 256,
        y: 0,
        width: 64 / 256,
        height: 128 / 256
      },
      armor: {
        x: 0,
        y: 64 / 256,
        width: 192 / 256,
        height: 192 / 256
      }
    };

    // Dimensions du support
    const width = 0.5;          // Largeur totale
    const baseSize = 0.4;       // Taille de la base
    const totalHeight = 0.8;    // Hauteur totale
    const poleWidth = 0.04;     // Largeur du poteau central
    const shoulderWidth = 0.4;  // Largeur des épaules

    // Décalages pour centrer
    const offsetX = -width / 2;
    const offsetY = -baseSize / 2;

    // Base en croix
    // Barre horizontale de la base
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX, offsetY + baseSize / 2 - poleWidth / 2, 0.01],
      [offsetX + width, offsetY + baseSize / 2 - poleWidth / 2, 0.01],
      [offsetX + width, offsetY + baseSize / 2 + poleWidth / 2, 0.01],
      [offsetX, offsetY + baseSize / 2 + poleWidth / 2, 0.01],
      uvMap.wood
    );

    // Barre verticale de la base
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX + width / 2 - poleWidth / 2, offsetY, 0.01],
      [offsetX + width / 2 + poleWidth / 2, offsetY, 0.01],
      [offsetX + width / 2 + poleWidth / 2, offsetY + baseSize, 0.01],
      [offsetX + width / 2 - poleWidth / 2, offsetY + baseSize, 0.01],
      uvMap.wood
    );

    // Poteau central
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX + width / 2 - poleWidth / 2, offsetY + baseSize / 2 - poleWidth / 2, 0],
      [offsetX + width / 2 + poleWidth / 2, offsetY + baseSize / 2 - poleWidth / 2, 0],
      [offsetX + width / 2 + poleWidth / 2, offsetY + baseSize / 2 - poleWidth / 2, totalHeight * 0.7],
      [offsetX + width / 2 - poleWidth / 2, offsetY + baseSize / 2 - poleWidth / 2, totalHeight * 0.7],
      uvMap.wood
    );

    // Support des épaules (barre horizontale)
    const shoulderHeight = totalHeight * 0.7;
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX + width / 2 - shoulderWidth / 2, offsetY + baseSize / 2 - poleWidth / 2, shoulderHeight],
      [offsetX + width / 2 + shoulderWidth / 2, offsetY + baseSize / 2 - poleWidth / 2, shoulderHeight],
      [offsetX + width / 2 + shoulderWidth / 2, offsetY + baseSize / 2 + poleWidth / 2, shoulderHeight],
      [offsetX + width / 2 - shoulderWidth / 2, offsetY + baseSize / 2 + poleWidth / 2, shoulderHeight],
      uvMap.wood
    );

    return geometry;
  }

  static getWeaponRackGeometry(geometry) {
    const uvMap = {
      wood: {
        x: 0,
        y: 0,
        width: 192 / 256,
        height: 128 / 256
      },
      metal: {
        x: 192 / 256,
        y: 0,
        width: 64 / 256,
        height: 128 / 256
      },
      detail: {
        x: 0,
        y: 128 / 256,
        width: 192 / 256,
        height: 64 / 256
      }
    };

    // Dimensions du râtelier
    const width = 0.6;          // Largeur totale
    const baseHeight = 0.1;     // Hauteur du bac
    const totalHeight = 0.4;    // Hauteur totale
    const depth = 0.2;          // Profondeur
    const thickness = 0.03;     // Épaisseur des matériaux

    // Décalages pour centrer horizontalement et placer contre le mur
    const offsetX = -width / 2;
    const offsetY = 0.5 - depth; // Placement contre le mur arrière

    // Bac de réception
    // Face avant
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX, offsetY, 0],
      [offsetX + width, offsetY, 0],
      [offsetX + width, offsetY, baseHeight],
      [offsetX, offsetY, baseHeight],
      uvMap.wood
    );

    // Face arrière
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX, offsetY + depth, 0],
      [offsetX + width, offsetY + depth, 0],
      [offsetX + width, offsetY + depth, baseHeight],
      [offsetX, offsetY + depth, baseHeight],
      uvMap.wood
    );

    // Faces latérales
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX, offsetY, 0],
      [offsetX, offsetY + depth, 0],
      [offsetX, offsetY + depth, baseHeight],
      [offsetX, offsetY, baseHeight],
      uvMap.wood
    );

    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX + width, offsetY, 0],
      [offsetX + width, offsetY + depth, 0],
      [offsetX + width, offsetY + depth, baseHeight],
      [offsetX + width, offsetY, baseHeight],
      uvMap.wood
    );

    // Fond du bac
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX, offsetY, 0.01],
      [offsetX + width, offsetY, 0.01],
      [offsetX + width, offsetY + depth, 0.01],
      [offsetX, offsetY + depth, 0.01],
      uvMap.wood
    );

    // Montants verticaux arrière
    const poleWidth = 0.04;

    // Montant gauche avant
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX + poleWidth, offsetY + depth - poleWidth / 4, baseHeight],
      [offsetX + poleWidth * 2, offsetY + depth - poleWidth / 4, baseHeight],
      [offsetX + poleWidth * 2, offsetY + depth - poleWidth / 4, totalHeight],
      [offsetX + poleWidth, offsetY + depth - poleWidth / 4, totalHeight],
      uvMap.detail
    );

    // Montant droit avant
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX + width - poleWidth * 2, offsetY + depth - poleWidth / 4, baseHeight],
      [offsetX + width - poleWidth, offsetY + depth - poleWidth / 4, baseHeight],
      [offsetX + width - poleWidth, offsetY + depth - poleWidth / 4, totalHeight],
      [offsetX + width - poleWidth * 2, offsetY + depth - poleWidth / 4, totalHeight],
      uvMap.detail
    );

    // Montant gauche arrière
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX + poleWidth, offsetY + depth, baseHeight],
      [offsetX + poleWidth * 2, offsetY + depth, baseHeight],
      [offsetX + poleWidth * 2, offsetY + depth, totalHeight],
      [offsetX + poleWidth, offsetY + depth, totalHeight],
      uvMap.detail
    );

    // Montant droit arrière
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX + width - poleWidth * 2, offsetY + depth, baseHeight],
      [offsetX + width - poleWidth, offsetY + depth, baseHeight],
      [offsetX + width - poleWidth, offsetY + depth, totalHeight],
      [offsetX + width - poleWidth * 2, offsetY + depth, totalHeight],
      uvMap.detail
    );

    // Montant gauche
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX + poleWidth, offsetY, baseHeight],
      [offsetX + poleWidth, offsetY + depth, baseHeight],
      [offsetX + poleWidth, offsetY + depth, totalHeight],
      [offsetX + poleWidth, offsetY, totalHeight],
      uvMap.metal
    );

    // Montant droit
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX + width - poleWidth, offsetY, baseHeight],
      [offsetX + width - poleWidth, offsetY + depth, baseHeight],
      [offsetX + width - poleWidth, offsetY + depth, totalHeight],
      [offsetX + width - poleWidth, offsetY, totalHeight],
      uvMap.metal
    );

    // Barre horizontale supérieure
    const barHeight = totalHeight - poleWidth;
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX + poleWidth, offsetY + depth - poleWidth / 4, barHeight],
      [offsetX + width - poleWidth, offsetY + depth - poleWidth / 4, barHeight],
      [offsetX + width - poleWidth, offsetY + depth - poleWidth / 4, barHeight + poleWidth],
      [offsetX + poleWidth, offsetY + depth - poleWidth / 4, barHeight + poleWidth],
      uvMap.metal
    );

    return geometry;
  }

  static getBinGeometry(geometry) {
    const uvMap = {
      front: {
        x: 0,
        y: 0,
        width: 128 / 256,
        height: 128 / 256
      },
      top: {
        x: 128 / 256,
        y: 0,
        width: 128 / 256,
        height: 128 / 256
      },
      side: {
        x: 0,
        y: 128 / 256,
        width: 128 / 256,
        height: 128 / 256
      },
      plank: {
        x: 128 / 256,
        y: 128 / 256,
        width: 128 / 256,
        height: 32 / 256
      }
    };

    // Dimensions de la caisse
    const width = 0.6;          // Largeur totale
    const height = 0.3;         // Hauteur totale
    const depth = 0.6;          // Profondeur
    const plankThickness = 0.05; // Épaisseur des planches
    const cornerSize = 0.05;    // Taille des renforts de coin

    // Décalages pour centrer
    const offsetX = -width / 2;
    const offsetY = -depth / 2;

    // Base de la caisse
    // Face avant
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX, offsetY, 0],
      [offsetX + width, offsetY, 0],
      [offsetX + width, offsetY, height],
      [offsetX, offsetY, height],
      uvMap.front
    );

    // Face arrière
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX, offsetY + depth, 0],
      [offsetX + width, offsetY + depth, 0],
      [offsetX + width, offsetY + depth, height],
      [offsetX, offsetY + depth, height],
      uvMap.front
    );

    // Face gauche
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX, offsetY, 0],
      [offsetX, offsetY + depth, 0],
      [offsetX, offsetY + depth, height],
      [offsetX, offsetY, height],
      uvMap.side
    );

    // Face droite
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX + width, offsetY, 0],
      [offsetX + width, offsetY + depth, 0],
      [offsetX + width, offsetY + depth, height],
      [offsetX + width, offsetY, height],
      uvMap.side
    );

    // Dessus
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX, offsetY, height],
      [offsetX + width, offsetY, height],
      [offsetX + width, offsetY + depth, height],
      [offsetX, offsetY + depth, height],
      uvMap.top
    );

    // Dessous
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX, offsetY, 0],
      [offsetX + width, offsetY, 0],
      [offsetX + width, offsetY + depth, 0],
      [offsetX, offsetY + depth, 0],
      uvMap.top
    );

    // Planches horizontales de renfort (face avant)
    const plankPositions = [height / 4, height * 3 / 4];
    plankPositions.forEach(y => {
      FurnitureGeometryFactory._addQuad(
        geometry,
        [offsetX, offsetY - plankThickness / 10, y - plankThickness / 2],
        [offsetX + width, offsetY - plankThickness / 10, y - plankThickness / 2],
        [offsetX + width, offsetY - plankThickness / 10, y + plankThickness / 2],
        [offsetX, offsetY - plankThickness / 10, y + plankThickness / 2],
        uvMap.plank
      );
    });

    // Planches horizontales de renfort (face arrière)
    plankPositions.forEach(y => {
      FurnitureGeometryFactory._addQuad(
        geometry,
        [offsetX, offsetY + depth + plankThickness / 10, y - plankThickness / 2],
        [offsetX + width, offsetY + depth + plankThickness / 10, y - plankThickness / 2],
        [offsetX + width, offsetY + depth + plankThickness / 10, y + plankThickness / 2],
        [offsetX, offsetY + depth + plankThickness / 10, y + plankThickness / 2],
        uvMap.plank
      );
    });

    // Renforts de coin (verticaux)
    // Avant gauche
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX, offsetY - plankThickness / 10, 0],
      [offsetX + cornerSize, offsetY - plankThickness / 10, 0],
      [offsetX + cornerSize, offsetY - plankThickness / 10, height],
      [offsetX, offsetY - plankThickness / 10, height],
      uvMap.plank
    );

    // Avant droit
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX + width - cornerSize, offsetY - plankThickness / 10, 0],
      [offsetX + width, offsetY - plankThickness / 10, 0],
      [offsetX + width, offsetY - plankThickness / 10, height],
      [offsetX + width - cornerSize, offsetY - plankThickness / 10, height],
      uvMap.plank
    );

    // Arrière gauche
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX, offsetY + depth + plankThickness / 10, 0],
      [offsetX + cornerSize, offsetY + depth + plankThickness / 10, 0],
      [offsetX + cornerSize, offsetY + depth + plankThickness / 10, height],
      [offsetX, offsetY + depth + plankThickness / 10, height],
      uvMap.plank
    );

    // Arrière droit
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX + width - cornerSize, offsetY + depth + plankThickness / 10, 0],
      [offsetX + width, offsetY + depth + plankThickness / 10, 0],
      [offsetX + width, offsetY + depth + plankThickness / 10, height],
      [offsetX + width - cornerSize, offsetY + depth + plankThickness / 10, height],
      uvMap.plank
    );

    return geometry;
  }

  static getBarrelGeometry(geometry) {
    const uvMap = {
      wood: {
        x: 0,
        y: 0,
        width: 192 / 256,
        height: 128 / 256
      },
      top: {
        x: 0,
        y: 128 / 256,
        width: 128 / 256,
        height: 128 / 256
      },
      metal: {
        x: 192 / 256,
        y: 0,
        width: 64 / 256,
        height: 256 / 256
      }
    };

    // Dimensions du tonneau
    const width = 0.3;          // Largeur
    const height = 0.4;         // Hauteur
    const bulge = 0.05;         // Renflement au milieu
    const segments = 12;        // Nombre de segments pour la rondeur
    const hoopWidth = 0.03;     // Largeur des cerclages métalliques

    // Décalages pour centrer
    const offsetX = -width / 2;
    const offsetY = -width / 2;

    // Fonction utilitaire pour calculer le renflement à une hauteur donnée
    const getBulgeAt = (h) => {
      // Formule parabolique pour le renflement
      const normalizedHeight = (h - height / 2) / (height / 2);
      return bulge * (1 - normalizedHeight * normalizedHeight);
    };

    // Création des douves (faces verticales)
    for (let i = 0; i < segments; i++) {
      const angle1 = (i / segments) * Math.PI * 2;
      const angle2 = ((i + 1) / segments) * Math.PI * 2;

      // Points pour le bas
      const x1Bottom = Math.cos(angle1) * (width / 2);
      const y1Bottom = Math.sin(angle1) * (width / 2);
      const x2Bottom = Math.cos(angle2) * (width / 2);
      const y2Bottom = Math.sin(angle2) * (width / 2);

      // Points pour le milieu (avec renflement)
      const x1Middle = Math.cos(angle1) * (width / 2 + bulge);
      const y1Middle = Math.sin(angle1) * (width / 2 + bulge);
      const x2Middle = Math.cos(angle2) * (width / 2 + bulge);
      const y2Middle = Math.sin(angle2) * (width / 2 + bulge);

      // Points pour le haut
      const x1Top = Math.cos(angle1) * (width / 2);
      const y1Top = Math.sin(angle1) * (width / 2);
      const x2Top = Math.cos(angle2) * (width / 2);
      const y2Top = Math.sin(angle2) * (width / 2);

      // Partie basse de la douve
      FurnitureGeometryFactory._addQuad(
        geometry,
        [offsetX + width / 2 + x1Bottom, offsetY + width / 2 + y1Bottom, 0],
        [offsetX + width / 2 + x2Bottom, offsetY + width / 2 + y2Bottom, 0],
        [offsetX + width / 2 + x2Middle, offsetY + width / 2 + y2Middle, height / 2],
        [offsetX + width / 2 + x1Middle, offsetY + width / 2 + y1Middle, height / 2],
        uvMap.wood
      );

      // Partie haute de la douve
      FurnitureGeometryFactory._addQuad(
        geometry,
        [offsetX + width / 2 + x1Middle, offsetY + width / 2 + y1Middle, height / 2],
        [offsetX + width / 2 + x2Middle, offsetY + width / 2 + y2Middle, height / 2],
        [offsetX + width / 2 + x2Top, offsetY + width / 2 + y2Top, height],
        [offsetX + width / 2 + x1Top, offsetY + width / 2 + y1Top, height],
        uvMap.wood
      );
    }

    // Création des cercles du haut et du bas
    for (let i = 0; i < segments; i++) {
      const angle1 = (i / segments) * Math.PI * 2;
      const angle2 = ((i + 1) / segments) * Math.PI * 2;

      // Points pour le cercle
      const x1 = Math.cos(angle1) * (width / 2);
      const y1 = Math.sin(angle1) * (width / 2);
      const x2 = Math.cos(angle2) * (width / 2);
      const y2 = Math.sin(angle2) * (width / 2);

      // Cercle du bas
      FurnitureGeometryFactory._addQuad(
        geometry,
        [offsetX + width / 2, offsetY + width / 2, 0],
        [offsetX + width / 2 + x1, offsetY + width / 2 + y1, 0],
        [offsetX + width / 2 + x2, offsetY + width / 2 + y2, 0],
        [offsetX + width / 2, offsetY + width / 2, 0],
        uvMap.top
      );

      // Cercle du haut
      FurnitureGeometryFactory._addQuad(
        geometry,
        [offsetX + width / 2, offsetY + width / 2, height],
        [offsetX + width / 2 + x1, offsetY + width / 2 + y1, height],
        [offsetX + width / 2 + x2, offsetY + width / 2 + y2, height],
        [offsetX + width / 2, offsetY + width / 2, height],
        uvMap.top
      );
    }

    // Cerclages métalliques
    const hoopHeights = [hoopWidth, height / 4, height / 2, height * 3 / 4, height - hoopWidth];

    hoopHeights.forEach(hoopHeight => {
      const bulgeFactor = getBulgeAt(hoopHeight);

      for (let i = 0; i < segments; i++) {
        const angle1 = (i / segments) * Math.PI * 2;
        const angle2 = ((i + 1) / segments) * Math.PI * 2;

        const x1 = Math.cos(angle1) * (width / 2 + bulgeFactor);
        const y1 = Math.sin(angle1) * (width / 2 + bulgeFactor);
        const x2 = Math.cos(angle2) * (width / 2 + bulgeFactor);
        const y2 = Math.sin(angle2) * (width / 2 + bulgeFactor);

        FurnitureGeometryFactory._addQuad(
          geometry,
          [offsetX + width / 2 + x1, offsetY + width / 2 + y1, hoopHeight - hoopWidth / 2],
          [offsetX + width / 2 + x2, offsetY + width / 2 + y2, hoopHeight - hoopWidth / 2],
          [offsetX + width / 2 + x2, offsetY + width / 2 + y2, hoopHeight + hoopWidth / 2],
          [offsetX + width / 2 + x1, offsetY + width / 2 + y1, hoopHeight + hoopWidth / 2],
          uvMap.metal
        );
      }
    });

    return geometry;
  }

  static getSarcophagusGeometry(geometry) {
    const uvMap = {
      lid: {
        x: 0,
        y: 0,
        width: 192 / 256,
        height: 128 / 256
      },
      side: {
        x: 192 / 256,
        y: 0,
        width: 64 / 256,
        height: 192 / 256
      },
      face: {
        x: 0,
        y: 128 / 256,
        width: 192 / 256,
        height: 128 / 256
      }
    };

    // Dimensions du sarcophage
    const width = 0.4;       // Largeur totale
    const depth = 0.7;       // Profondeur
    const height = 0.3;      // Hauteur totale
    const lidHeight = 0.2;   // Hauteur du couvercle
    const baseHeight = height - lidHeight; // Hauteur de la base

    // Décalages pour centrer et placer contre le mur
    const offsetX = -width / 2;
    const offsetY = 0.5 - depth; // Placement contre le bord arrière

    // Base du sarcophage
    // Face avant
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX, offsetY, 0],
      [offsetX + width, offsetY, 0],
      [offsetX + width, offsetY, baseHeight],
      [offsetX, offsetY, baseHeight],
      uvMap.face
    );

    // Face arrière
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX, offsetY + depth, 0],
      [offsetX + width, offsetY + depth, 0],
      [offsetX + width, offsetY + depth, baseHeight],
      [offsetX, offsetY + depth, baseHeight],
      uvMap.face
    );

    // Côté gauche
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX, offsetY, 0],
      [offsetX, offsetY + depth, 0],
      [offsetX, offsetY + depth, baseHeight],
      [offsetX, offsetY, baseHeight],
      uvMap.side
    );

    // Côté droit
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX + width, offsetY, 0],
      [offsetX + width, offsetY + depth, 0],
      [offsetX + width, offsetY + depth, baseHeight],
      [offsetX + width, offsetY, baseHeight],
      uvMap.side
    );

    // Base inférieure
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX, offsetY, 0],
      [offsetX + width, offsetY, 0],
      [offsetX + width, offsetY + depth, 0],
      [offsetX, offsetY + depth, 0],
      uvMap.face
    );

    // Couvercle
    const lidOverhang = 0.02; // Débordement du couvercle

    // Face avant du couvercle (légèrement inclinée)
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX - lidOverhang, offsetY - lidOverhang, baseHeight],
      [offsetX + width + lidOverhang, offsetY - lidOverhang, baseHeight],
      [offsetX + width + lidOverhang, offsetY - lidOverhang, height],
      [offsetX - lidOverhang, offsetY - lidOverhang, height],
      uvMap.face
    );

    // Face arrière du couvercle
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX - lidOverhang, offsetY + depth + lidOverhang, baseHeight],
      [offsetX + width + lidOverhang, offsetY + depth + lidOverhang, baseHeight],
      [offsetX + width + lidOverhang, offsetY + depth + lidOverhang, height],
      [offsetX - lidOverhang, offsetY + depth + lidOverhang, height],
      uvMap.face
    );

    // Côtés du couvercle
    // Gauche
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX - lidOverhang, offsetY - lidOverhang, baseHeight],
      [offsetX - lidOverhang, offsetY + depth + lidOverhang, baseHeight],
      [offsetX - lidOverhang, offsetY + depth + lidOverhang, height],
      [offsetX - lidOverhang, offsetY - lidOverhang, height],
      uvMap.side
    );

    // Droit
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX + width + lidOverhang, offsetY - lidOverhang, baseHeight],
      [offsetX + width + lidOverhang, offsetY + depth + lidOverhang, baseHeight],
      [offsetX + width + lidOverhang, offsetY + depth + lidOverhang, height],
      [offsetX + width + lidOverhang, offsetY - lidOverhang, height],
      uvMap.side
    );

    // Dessus du couvercle (légèrement bombé/pyramidal)
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX - lidOverhang, offsetY - lidOverhang, height],
      [offsetX + width + lidOverhang, offsetY - lidOverhang, height],
      [offsetX + width + lidOverhang, offsetY + depth + lidOverhang, height],
      [offsetX - lidOverhang, offsetY + depth + lidOverhang, height],
      uvMap.lid
    );

    return geometry;
  }

  static getShelfGeometry(geometry) {
    const uvMap = {
      shelf: {
        x: 0,
        y: 0,
        width: 192 / 256,
        height: 64 / 256
      },
      side: {
        x: 192 / 256,
        y: 0,
        width: 64 / 256,
        height: 192 / 256
      },
      back: {
        x: 0,
        y: 64 / 256,
        width: 192 / 256,
        height: 192 / 256
      }
    };

    // Dimensions de l'étagère
    const width = 0.8;       // Largeur totale
    const depth = 0.3;       // Profondeur
    const height = 0.8;      // Hauteur totale
    const thickness = 0.03;  // Épaisseur des planches
    const numShelves = 3;    // Nombre d'étagères (incluant haut et bas)

    // Décalages pour centrer horizontalement et placer contre le mur
    const offsetX = -width / 2;
    const offsetY = 0.5 - depth; // Placement contre le bord arrière (0.5 = moitié de la cellule)

    // Panneau arrière
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX, offsetY + depth - thickness, 0],
      [offsetX + width, offsetY + depth - thickness, 0],
      [offsetX + width, offsetY + depth - thickness, height],
      [offsetX, offsetY + depth - thickness, height],
      uvMap.back
    );

    // Panneaux latéraux
    // Gauche
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX, offsetY, 0],
      [offsetX, offsetY + depth, 0],
      [offsetX, offsetY + depth, height],
      [offsetX, offsetY, height],
      uvMap.side
    );

    // Droite
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX + width, offsetY, 0],
      [offsetX + width, offsetY + depth, 0],
      [offsetX + width, offsetY + depth, height],
      [offsetX + width, offsetY, height],
      uvMap.side
    );

    // Étagères horizontales
    for (let i = 0; i < numShelves; i++) {
      const shelfHeight = (i === 0 ? 0.1 : i) * (height / (numShelves - 1));

      // Surface supérieure de l'étagère
      FurnitureGeometryFactory._addQuad(
        geometry,
        [offsetX, offsetY, shelfHeight],
        [offsetX + width, offsetY, shelfHeight],
        [offsetX + width, offsetY + depth, shelfHeight],
        [offsetX, offsetY + depth, shelfHeight],
        uvMap.shelf
      );

      // Face avant de l'étagère
      FurnitureGeometryFactory._addQuad(
        geometry,
        [offsetX, offsetY, shelfHeight - thickness],
        [offsetX + width, offsetY, shelfHeight - thickness],
        [offsetX + width, offsetY, shelfHeight],
        [offsetX, offsetY, shelfHeight],
        uvMap.shelf
      );

      // Surface inférieure de l'étagère (sauf pour l'étagère du bas)
      if (i > 0) {
        FurnitureGeometryFactory._addQuad(
          geometry,
          [offsetX, offsetY, shelfHeight - thickness],
          [offsetX + width, offsetY, shelfHeight - thickness],
          [offsetX + width, offsetY + depth, shelfHeight - thickness],
          [offsetX, offsetY + depth, shelfHeight - thickness],
          uvMap.shelf
        );
      }
    }

    return geometry;
  }

  static getStatueGeometry(geometry) {
    const uvMap = {
      pedestal: {
        x: 0,
        y: 0,
        width: 128 / 256,
        height: 128 / 256
      },
      statue: {
        x: 128 / 256,
        y: 0,
        width: 128 / 256,
        height: 192 / 256
      },
      detail: {
        x: 0,
        y: 128 / 256,
        width: 128 / 256,
        height: 128 / 256
      }
    };

    // Dimensions
    const baseWidth = 0.6;      // Largeur du piédestal
    const baseHeight = 0.2;     // Hauteur du piédestal
    const statueHeight = 0.7;   // Hauteur de la statue
    const bodyWidth = 0.2;      // Largeur du corps
    const shoulderWidth = 0.3;  // Largeur des épaules
    const headSize = 0.12;      // Taille de la tête

    // Décalages pour centrer
    const offsetX = -baseWidth / 2;
    const offsetY = -baseWidth / 2;

    // Piédestal
    // Base large
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX, offsetY, 0],
      [offsetX + baseWidth, offsetY, 0],
      [offsetX + baseWidth, offsetY + baseWidth, 0],
      [offsetX, offsetY + baseWidth, 0],
      uvMap.pedestal
    );

    // Faces du piédestal
    // Avant
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX, offsetY, 0],
      [offsetX + baseWidth, offsetY, 0],
      [offsetX + baseWidth, offsetY, baseHeight],
      [offsetX, offsetY, baseHeight],
      uvMap.pedestal
    );

    // Arrière
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX, offsetY + baseWidth, 0],
      [offsetX + baseWidth, offsetY + baseWidth, 0],
      [offsetX + baseWidth, offsetY + baseWidth, baseHeight],
      [offsetX, offsetY + baseWidth, baseHeight],
      uvMap.pedestal
    );

    // Gauche
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX, offsetY, 0],
      [offsetX, offsetY + baseWidth, 0],
      [offsetX, offsetY + baseWidth, baseHeight],
      [offsetX, offsetY, baseHeight],
      uvMap.pedestal
    );

    // Droite
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX + baseWidth, offsetY, 0],
      [offsetX + baseWidth, offsetY + baseWidth, 0],
      [offsetX + baseWidth, offsetY + baseWidth, baseHeight],
      [offsetX + baseWidth, offsetY, baseHeight],
      uvMap.pedestal
    );

    // Surface du piédestal
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX, offsetY, baseHeight],
      [offsetX + baseWidth, offsetY, baseHeight],
      [offsetX + baseWidth, offsetY + baseWidth, baseHeight],
      [offsetX, offsetY + baseWidth, baseHeight],
      uvMap.pedestal
    );

    // Corps de la statue
    const bodyOffsetX = -bodyWidth / 2;
    const bodyOffsetY = -bodyWidth / 2;

    // Torse
    FurnitureGeometryFactory._addQuad(
      geometry,
      [bodyOffsetX, bodyOffsetY, baseHeight],
      [bodyOffsetX + bodyWidth, bodyOffsetY, baseHeight],
      [bodyOffsetX + bodyWidth, bodyOffsetY, baseHeight + statueHeight * 0.6],
      [bodyOffsetX, bodyOffsetY, baseHeight + statueHeight * 0.6],
      uvMap.statue
    );

    // Gauche
    FurnitureGeometryFactory._addQuad(
      geometry,
      [bodyOffsetX, bodyOffsetY, baseHeight],
      [bodyOffsetX, bodyOffsetY + bodyWidth, baseHeight],
      [bodyOffsetX, bodyOffsetY + bodyWidth, baseHeight + statueHeight * 0.6],
      [bodyOffsetX, bodyOffsetY, baseHeight + statueHeight * 0.6],
      uvMap.statue
    );

    // Droite
    FurnitureGeometryFactory._addQuad(
      geometry,
      [bodyOffsetX + bodyWidth, bodyOffsetY, baseHeight],
      [bodyOffsetX + bodyWidth, bodyOffsetY + bodyWidth, baseHeight],
      [bodyOffsetX + bodyWidth, bodyOffsetY + bodyWidth, baseHeight + statueHeight * 0.6],
      [bodyOffsetX + bodyWidth, bodyOffsetY, baseHeight + statueHeight * 0.6],
      uvMap.statue
    );

    FurnitureGeometryFactory._addQuad(
      geometry,
      [bodyOffsetX, bodyOffsetY + bodyWidth, baseHeight],
      [bodyOffsetX + bodyWidth, bodyOffsetY + bodyWidth, baseHeight],
      [bodyOffsetX + bodyWidth, bodyOffsetY + bodyWidth, baseHeight + statueHeight * 0.6],
      [bodyOffsetX, bodyOffsetY + bodyWidth, baseHeight + statueHeight * 0.6],
      uvMap.statue
    );

    // Épaules
    const shoulderHeight = baseHeight + statueHeight * 0.5;
    const shoulderOffsetX = -shoulderWidth / 2;

    FurnitureGeometryFactory._addQuad(
      geometry,
      [shoulderOffsetX, bodyOffsetY, shoulderHeight],
      [shoulderOffsetX + shoulderWidth, bodyOffsetY, shoulderHeight],
      [shoulderOffsetX + shoulderWidth, bodyOffsetY, shoulderHeight + statueHeight * 0.1],
      [shoulderOffsetX, bodyOffsetY, shoulderHeight + statueHeight * 0.1],
      uvMap.statue
    );

    // Tête
    const neckHeight = shoulderHeight + statueHeight * 0.1;
    const headOffsetX = -headSize / 2;
    const headOffsetY = -headSize / 2;

    // Face avant
    FurnitureGeometryFactory._addQuad(
      geometry,
      [headOffsetX, headOffsetY, neckHeight],
      [headOffsetX + headSize, headOffsetY, neckHeight],
      [headOffsetX + headSize, headOffsetY, neckHeight + headSize],
      [headOffsetX, headOffsetY, neckHeight + headSize],
      uvMap.detail
    );

    // Face arrière
    FurnitureGeometryFactory._addQuad(
      geometry,
      [headOffsetX, headOffsetY + headSize, neckHeight],
      [headOffsetX + headSize, headOffsetY + headSize, neckHeight],
      [headOffsetX + headSize, headOffsetY + headSize, neckHeight + headSize],
      [headOffsetX, headOffsetY + headSize, neckHeight + headSize],
      uvMap.detail
    );

    // Côtés de la tête
    FurnitureGeometryFactory._addQuad(
      geometry,
      [headOffsetX, headOffsetY, neckHeight],
      [headOffsetX, headOffsetY + headSize, neckHeight],
      [headOffsetX, headOffsetY + headSize, neckHeight + headSize],
      [headOffsetX, headOffsetY, neckHeight + headSize],
      uvMap.detail
    );

    FurnitureGeometryFactory._addQuad(
      geometry,
      [headOffsetX + headSize, headOffsetY, neckHeight],
      [headOffsetX + headSize, headOffsetY + headSize, neckHeight],
      [headOffsetX + headSize, headOffsetY + headSize, neckHeight + headSize],
      [headOffsetX + headSize, headOffsetY, neckHeight + headSize],
      uvMap.detail
    );

    // Dessus de la tête
    FurnitureGeometryFactory._addQuad(
      geometry,
      [headOffsetX, headOffsetY, neckHeight + headSize],
      [headOffsetX + headSize, headOffsetY, neckHeight + headSize],
      [headOffsetX + headSize, headOffsetY + headSize, neckHeight + headSize],
      [headOffsetX, headOffsetY + headSize, neckHeight + headSize],
      uvMap.detail
    );

    return geometry;
  }

  static getChairGeometry(geometry) {
    const uvMap = {
      seat: {
        x: 0,
        y: 0,
        width: 128 / 256,
        height: 128 / 256
      },
      backrest: {
        x: 128 / 256,
        y: 0,
        width: 128 / 256,
        height: 128 / 256
      },
      leg: {
        x: 192 / 256,
        y: 128 / 256,
        width: 64 / 256,
        height: 128 / 256
      },
      side: {
        x: 0,
        y: 192 / 256,
        width: 192 / 256,
        height: 64 / 256
      }
    };

    // Dimensions de la chaise
    const width = 0.4;          // Largeur de l'assise
    const depth = 0.4;          // Profondeur de l'assise
    const seatHeight = 0.15;     // Hauteur de l'assise
    const backHeight = 0.2;     // Hauteur du dossier depuis l'assise
    const thickness = 0.04;     // Épaisseur de l'assise et du dossier
    const legWidth = 0.04;      // Largeur des pieds

    // Décalages pour centrer la chaise
    const offsetX = -width / 2;
    const offsetY = -depth / 2;

    // Assise
    // Face supérieure
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX, offsetY, seatHeight],
      [offsetX + width, offsetY, seatHeight],
      [offsetX + width, offsetY + depth, seatHeight],
      [offsetX, offsetY + depth, seatHeight],
      uvMap.seat
    );

    // Face inférieure
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX, offsetY, seatHeight - thickness],
      [offsetX + width, offsetY, seatHeight - thickness],
      [offsetX + width, offsetY + depth, seatHeight - thickness],
      [offsetX, offsetY + depth, seatHeight - thickness],
      uvMap.seat
    );

    // Bords de l'assise
    // Avant
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX, offsetY, seatHeight - thickness],
      [offsetX + width, offsetY, seatHeight - thickness],
      [offsetX + width, offsetY, seatHeight],
      [offsetX, offsetY, seatHeight],
      uvMap.side
    );

    // Droite
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX + width, offsetY, seatHeight - thickness],
      [offsetX + width, offsetY + depth, seatHeight - thickness],
      [offsetX + width, offsetY + depth, seatHeight],
      [offsetX + width, offsetY, seatHeight],
      uvMap.side
    );

    // Gauche
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX, offsetY, seatHeight - thickness],
      [offsetX, offsetY + depth, seatHeight - thickness],
      [offsetX, offsetY + depth, seatHeight],
      [offsetX, offsetY, seatHeight],
      uvMap.side
    );

    // Dossier
    // Face avant
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX, offsetY + depth - thickness, seatHeight],
      [offsetX + width, offsetY + depth - thickness, seatHeight],
      [offsetX + width, offsetY + depth - thickness, seatHeight + backHeight],
      [offsetX, offsetY + depth - thickness, seatHeight + backHeight],
      uvMap.backrest
    );

    // Face arrière
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX, offsetY + depth, seatHeight],
      [offsetX + width, offsetY + depth, seatHeight],
      [offsetX + width, offsetY + depth, seatHeight + backHeight],
      [offsetX, offsetY + depth, seatHeight + backHeight],
      uvMap.backrest
    );

    // Côtés du dossier
    // Gauche
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX, offsetY + depth - thickness, seatHeight],
      [offsetX, offsetY + depth, seatHeight],
      [offsetX, offsetY + depth, seatHeight + backHeight],
      [offsetX, offsetY + depth - thickness, seatHeight + backHeight],
      uvMap.side
    );

    // Droite
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX + width, offsetY + depth - thickness, seatHeight],
      [offsetX + width, offsetY + depth, seatHeight],
      [offsetX + width, offsetY + depth, seatHeight + backHeight],
      [offsetX + width, offsetY + depth - thickness, seatHeight + backHeight],
      uvMap.side
    );

    // Haut du dossier
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX, offsetY + depth - thickness, seatHeight + backHeight],
      [offsetX + width, offsetY + depth - thickness, seatHeight + backHeight],
      [offsetX + width, offsetY + depth, seatHeight + backHeight],
      [offsetX, offsetY + depth, seatHeight + backHeight],
      uvMap.side
    );

    // Pieds
    const legInset = 0.03;

    // Pied avant gauche
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX + legInset, offsetY + legInset, 0],
      [offsetX + legInset + legWidth, offsetY + legInset, 0],
      [offsetX + legInset + legWidth, offsetY + legInset, seatHeight - thickness],
      [offsetX + legInset, offsetY + legInset, seatHeight - thickness],
      uvMap.leg
    );

    // Face côté du pied avant gauche
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX + legInset, offsetY + legInset, 0],
      [offsetX + legInset, offsetY + legInset + legWidth, 0],
      [offsetX + legInset, offsetY + legInset + legWidth, seatHeight - thickness],
      [offsetX + legInset, offsetY + legInset, seatHeight - thickness],
      uvMap.leg
    );

    // Pied avant droit
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX + width - legInset - legWidth, offsetY + legInset, 0],
      [offsetX + width - legInset, offsetY + legInset, 0],
      [offsetX + width - legInset, offsetY + legInset, seatHeight - thickness],
      [offsetX + width - legInset - legWidth, offsetY + legInset, seatHeight - thickness],
      uvMap.leg
    );

    // Face côté du pied avant droit
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX + width - legInset, offsetY + legInset, 0],
      [offsetX + width - legInset, offsetY + legInset + legWidth, 0],
      [offsetX + width - legInset, offsetY + legInset + legWidth, seatHeight - thickness],
      [offsetX + width - legInset, offsetY + legInset, seatHeight - thickness],
      uvMap.leg
    );

    // Pied arrière gauche (plus haut pour supporter le dossier)
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX + legInset, offsetY + depth - legInset - legWidth, 0],
      [offsetX + legInset + legWidth, offsetY + depth - legInset - legWidth, 0],
      [offsetX + legInset + legWidth, offsetY + depth - legInset - legWidth, seatHeight + backHeight],
      [offsetX + legInset, offsetY + depth - legInset - legWidth, seatHeight + backHeight],
      uvMap.leg
    );

    // Face côté du pied arrière gauche
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX + legInset, offsetY + depth - legInset - legWidth, 0],
      [offsetX + legInset, offsetY + depth - legInset, 0],
      [offsetX + legInset, offsetY + depth - legInset, seatHeight + backHeight],
      [offsetX + legInset, offsetY + depth - legInset - legWidth, seatHeight + backHeight],
      uvMap.leg
    );

    // Pied arrière droit (plus haut pour supporter le dossier)
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX + width - legInset - legWidth, offsetY + depth - legInset - legWidth, 0],
      [offsetX + width - legInset, offsetY + depth - legInset - legWidth, 0],
      [offsetX + width - legInset, offsetY + depth - legInset - legWidth, seatHeight + backHeight],
      [offsetX + width - legInset - legWidth, offsetY + depth - legInset - legWidth, seatHeight + backHeight],
      uvMap.leg
    );

    // Face côté du pied arrière droit
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX + width - legInset, offsetY + depth - legInset - legWidth, 0],
      [offsetX + width - legInset, offsetY + depth - legInset, 0],
      [offsetX + width - legInset, offsetY + depth - legInset, seatHeight + backHeight],
      [offsetX + width - legInset, offsetY + depth - legInset - legWidth, seatHeight + backHeight],
      uvMap.leg
    );

    return geometry;
  }

  static getTableGeometry(geometry) {
    const uvMap = {
      top: {
        x: 0,
        y: 0,
        width: 192 / 256,
        height: 192 / 256
      },
      leg: {
        x: 192 / 256,
        y: 0,
        width: 64 / 256,
        height: 128 / 256
      },
      side: {
        x: 0,
        y: 192 / 256,
        width: 192 / 256,
        height: 64 / 256
      }
    };

    // Dimensions de la table
    const width = 0.8;      // Largeur du plateau
    const depth = 0.6;      // Profondeur du plateau
    const height = 0.3;     // Hauteur totale
    const topThickness = 0.04; // Épaisseur du plateau
    const legWidth = 0.04;  // Largeur des pieds

    // Décalages pour centrer la table
    const offsetX = -width / 2;
    const offsetY = -depth / 2;

    // Plateau de la table
    // Face supérieure
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX, offsetY, height],
      [offsetX + width, offsetY, height],
      [offsetX + width, offsetY + depth, height],
      [offsetX, offsetY + depth, height],
      uvMap.top
    );

    // Face inférieure du plateau
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX, offsetY, height - topThickness],
      [offsetX + width, offsetY, height - topThickness],
      [offsetX + width, offsetY + depth, height - topThickness],
      [offsetX, offsetY + depth, height - topThickness],
      uvMap.top
    );

    // Bords du plateau
    // Avant
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX, offsetY, height - topThickness],
      [offsetX + width, offsetY, height - topThickness],
      [offsetX + width, offsetY, height],
      [offsetX, offsetY, height],
      uvMap.side
    );

    // Arrière
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX, offsetY + depth, height - topThickness],
      [offsetX + width, offsetY + depth, height - topThickness],
      [offsetX + width, offsetY + depth, height],
      [offsetX, offsetY + depth, height],
      uvMap.side
    );

    // Gauche
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX, offsetY, height - topThickness],
      [offsetX, offsetY + depth, height - topThickness],
      [offsetX, offsetY + depth, height],
      [offsetX, offsetY, height],
      uvMap.side
    );

    // Droite
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX + width, offsetY, height - topThickness],
      [offsetX + width, offsetY + depth, height - topThickness],
      [offsetX + width, offsetY + depth, height],
      [offsetX + width, offsetY, height],
      uvMap.side
    );

    // Pieds de la table
    const legInset = 0.05; // Distance du bord pour les pieds

    // Pied avant gauche
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX + legInset, offsetY + legInset, 0],
      [offsetX + legInset + legWidth, offsetY + legInset, 0],
      [offsetX + legInset + legWidth, offsetY + legInset, height - topThickness],
      [offsetX + legInset, offsetY + legInset, height - topThickness],
      uvMap.leg
    );

    // Face côté du pied avant gauche
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX + legInset, offsetY + legInset, 0],
      [offsetX + legInset, offsetY + legInset + legWidth, 0],
      [offsetX + legInset, offsetY + legInset + legWidth, height - topThickness],
      [offsetX + legInset, offsetY + legInset, height - topThickness],
      uvMap.leg
    );

    // Pied avant droit
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX + width - legInset - legWidth, offsetY + legInset, 0],
      [offsetX + width - legInset, offsetY + legInset, 0],
      [offsetX + width - legInset, offsetY + legInset, height - topThickness],
      [offsetX + width - legInset - legWidth, offsetY + legInset, height - topThickness],
      uvMap.leg
    );

    // Face côté du pied avant droit
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX + width - legInset, offsetY + legInset, 0],
      [offsetX + width - legInset, offsetY + legInset + legWidth, 0],
      [offsetX + width - legInset, offsetY + legInset + legWidth, height - topThickness],
      [offsetX + width - legInset, offsetY + legInset, height - topThickness],
      uvMap.leg
    );

    // Pied arrière gauche
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX + legInset, offsetY + depth - legInset - legWidth, 0],
      [offsetX + legInset + legWidth, offsetY + depth - legInset - legWidth, 0],
      [offsetX + legInset + legWidth, offsetY + depth - legInset - legWidth, height - topThickness],
      [offsetX + legInset, offsetY + depth - legInset - legWidth, height - topThickness],
      uvMap.leg
    );

    // Face côté du pied arrière gauche
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX + legInset, offsetY + depth - legInset - legWidth, 0],
      [offsetX + legInset, offsetY + depth - legInset, 0],
      [offsetX + legInset, offsetY + depth - legInset, height - topThickness],
      [offsetX + legInset, offsetY + depth - legInset - legWidth, height - topThickness],
      uvMap.leg
    );

    // Pied arrière droit
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX + width - legInset - legWidth, offsetY + depth - legInset - legWidth, 0],
      [offsetX + width - legInset, offsetY + depth - legInset - legWidth, 0],
      [offsetX + width - legInset, offsetY + depth - legInset - legWidth, height - topThickness],
      [offsetX + width - legInset - legWidth, offsetY + depth - legInset - legWidth, height - topThickness],
      uvMap.leg
    );

    // Face côté du pied arrière droit
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX + width - legInset, offsetY + depth - legInset - legWidth, 0],
      [offsetX + width - legInset, offsetY + depth - legInset, 0],
      [offsetX + width - legInset, offsetY + depth - legInset, height - topThickness],
      [offsetX + width - legInset, offsetY + depth - legInset - legWidth, height - topThickness],
      uvMap.leg
    );

    return geometry;
  };

  static getChestGeometry(geometry) {
    const uvMap = {
      top: {
        x: 0,
        y: 0,
        width: 192 / 256,
        height: 64 / 256
      },
      front: {
        x: 0,
        y: 64 / 256,
        width: 192 / 256,
        height: 64 / 256
      },
      side: {
        x: 192 / 256,
        y: 0,
        width: 64 / 256,
        height: 128 / 256
      }
    };

    // Dimensions du coffre
    const width = 0.4;      // Largeur totale du coffre
    const depth = 0.3;      // Profondeur du coffre
    const height = 0.2;     // Hauteur totale du coffre
    const legHeight = 0.05; // Hauteur des pieds

    // Décalages pour centrer le coffre horizontalement et le placer contre le bord
    const offsetX = -width / 2;
    const offsetY = 0.5 - depth; // Placement contre le bord arrière (0.5 = moitié de la cellule)

    // Pieds du coffre
    const legWidth = 0.05;

    // Pied avant gauche
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX + 0, offsetY + 0, 0],
      [offsetX + legWidth, offsetY + 0, 0],
      [offsetX + legWidth, offsetY + 0, legHeight],
      [offsetX + 0, offsetY + 0, legHeight],
      uvMap.side
    );

    // Pied avant droit
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX + width - legWidth, offsetY + 0, 0],
      [offsetX + width, offsetY + 0, 0],
      [offsetX + width, offsetY + 0, legHeight],
      [offsetX + width - legWidth, offsetY + 0, legHeight],
      uvMap.side
    );

    // Pied arrière gauche
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX + 0, offsetY + depth, 0],
      [offsetX + legWidth, offsetY + depth, 0],
      [offsetX + legWidth, offsetY + depth, legHeight],
      [offsetX + 0, offsetY + depth, legHeight],
      uvMap.side
    );

    // Pied arrière droit
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX + width - legWidth, offsetY + depth, 0],
      [offsetX + width, offsetY + depth, 0],
      [offsetX + width, offsetY + depth, legHeight],
      [offsetX + width - legWidth, offsetY + depth, legHeight],
      uvMap.side
    );

    // Corps du coffre
    // Face avant
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX + 0, offsetY + 0, legHeight],
      [offsetX + width, offsetY + 0, legHeight],
      [offsetX + width, offsetY + 0, legHeight + height],
      [offsetX + 0, offsetY + 0, legHeight + height],
      uvMap.front
    );

    // Face arrière
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX + 0, offsetY + depth, legHeight],
      [offsetX + width, offsetY + depth, legHeight],
      [offsetX + width, offsetY + depth, legHeight + height],
      [offsetX + 0, offsetY + depth, legHeight + height],
      uvMap.front
    );

    // Côté gauche
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX + 0, offsetY + 0, legHeight],
      [offsetX + 0, offsetY + depth, legHeight],
      [offsetX + 0, offsetY + depth, legHeight + height],
      [offsetX + 0, offsetY + 0, legHeight + height],
      uvMap.side
    );

    // Côté droit
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX + width, offsetY + 0, legHeight],
      [offsetX + width, offsetY + depth, legHeight],
      [offsetX + width, offsetY + depth, legHeight + height],
      [offsetX + width, offsetY + 0, legHeight + height],
      uvMap.side
    );

    // Couvercle (légèrement plus large pour l'effet de débordement)
    const lidOverhang = 0.02;
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX - lidOverhang, offsetY - lidOverhang, legHeight + height],
      [offsetX + width + lidOverhang, offsetY - lidOverhang, legHeight + height],
      [offsetX + width + lidOverhang, offsetY + depth + lidOverhang, legHeight + height],
      [offsetX - lidOverhang, offsetY + depth + lidOverhang, legHeight + height],
      uvMap.top
    );

    // Face avant du couvercle
    FurnitureGeometryFactory._addQuad(
      geometry,
      [offsetX - lidOverhang, offsetY - lidOverhang, legHeight + height],
      [offsetX + width + lidOverhang, offsetY - lidOverhang, legHeight + height],
      [offsetX + width + lidOverhang, offsetY - lidOverhang, legHeight + height - 0.05],
      [offsetX - lidOverhang, offsetY - lidOverhang, legHeight + height - 0.05],
      uvMap.front
    );

    return geometry;
  };

  static getBedGeometry(geometry) {

    const uvMap = {
      bedFrame: {
        x: 0,
        y: 0,
        width: 192 / 256,
        height: 128 / 256
      },
      headboard: {
        x: 0,
        y: 128 / 256,
        width: 192 / 256,
        height: 64 / 256
      },
      side: {
        x: 192 / 256,
        y: 0,
        width: 64 / 256,
        height: 128 / 256
      },
      mattress: {
        x: 0,
        y: 192 / 256,
        width: 192 / 256,
        height: 64 / 256
      }
    };

    // Dimensions du lit
    const width = 0.5;           // Largeur totale du lit
    const length = 1.0;          // Longueur totale du lit
    const baseHeight = 0.07;     // Hauteur du cadre de lit
    const mattressHeight = 0.1;  // Hauteur du matelas
    const legHeight = 0.05;       // Hauteur des pieds du lit
    const headHeight = 0.4;      // Hauteur de la tête de lit

    // Décalages pour centrer le lit
    const offsetX = -width / 2;
    const offsetY = -length / 2;

    // Pieds du lit
    const legWidth = 0.05;
    // Pied avant gauche
    FurnitureGeometryFactory._addQuad(
      geometry,
      [0 + offsetX, 0 + offsetY, 0],
      [legWidth + offsetX, 0 + offsetY, 0],
      [legWidth + offsetX, 0 + offsetY, legHeight],
      [0 + offsetX, 0 + offsetY, legHeight],
      uvMap.side
    );
    // Pied avant droit
    FurnitureGeometryFactory._addQuad(
      geometry,
      [width - legWidth + offsetX, 0 + offsetY, 0],
      [width + offsetX, 0 + offsetY, 0],
      [width + offsetX, 0 + offsetY, legHeight],
      [width - legWidth + offsetX, 0 + offsetY, legHeight],
      uvMap.side
    );
    // Pied arrière gauche
    FurnitureGeometryFactory._addQuad(
      geometry,
      [0 + offsetX, length + offsetY, 0],
      [legWidth + offsetX, length + offsetY, 0],
      [legWidth + offsetX, length + offsetY, legHeight],
      [0 + offsetX, length + offsetY, legHeight],
      uvMap.side
    );
    // Pied arrière droit
    FurnitureGeometryFactory._addQuad(
      geometry,
      [width - legWidth + offsetX, length + offsetY, 0],
      [width + offsetX, length + offsetY, 0],
      [width + offsetX, length + offsetY, legHeight],
      [width - legWidth + offsetX, length + offsetY, legHeight],
      uvMap.side
    );

    // Cadre du lit
    // Bord avant
    FurnitureGeometryFactory._addQuad(
      geometry,
      [0 + offsetX, 0 + offsetY, legHeight],
      [width + offsetX, 0 + offsetY, legHeight],
      [width + offsetX, 0 + offsetY, legHeight + baseHeight],
      [0 + offsetX, 0 + offsetY, legHeight + baseHeight],
      uvMap.bedFrame
    );
    // Bord arrière
    FurnitureGeometryFactory._addQuad(
      geometry,
      [0 + offsetX, length + offsetY, legHeight],
      [width + offsetX, length + offsetY, legHeight],
      [width + offsetX, length + offsetY, legHeight + baseHeight],
      [0 + offsetX, length + offsetY, legHeight + baseHeight],
      uvMap.bedFrame
    );
    // Bord gauche
    FurnitureGeometryFactory._addQuad(
      geometry,
      [0 + offsetX, 0 + offsetY, legHeight],
      [0 + offsetX, length + offsetY, legHeight],
      [0 + offsetX, length + offsetY, legHeight + baseHeight],
      [0 + offsetX, 0 + offsetY, legHeight + baseHeight],
      uvMap.side
    );
    // Bord droit
    FurnitureGeometryFactory._addQuad(
      geometry,
      [width + offsetX, 0 + offsetY, legHeight],
      [width + offsetX, length + offsetY, legHeight],
      [width + offsetX, length + offsetY, legHeight + baseHeight],
      [width + offsetX, 0 + offsetY, legHeight + baseHeight],
      uvMap.side
    );

    // Base du sommier
    FurnitureGeometryFactory._addQuad(
      geometry,
      [0 + offsetX, 0 + offsetY, legHeight + baseHeight - 0.01],
      [width + offsetX, 0 + offsetY, legHeight + baseHeight - 0.01],
      [width + offsetX, length + offsetY, legHeight + baseHeight - 0.01],
      [0 + offsetX, length + offsetY, legHeight + baseHeight - 0.01],
      uvMap.bedFrame
    );

    // Matelas
    const mattressInset = 0.02; // Petit espace entre le matelas et le cadre
    FurnitureGeometryFactory._addQuad(
      geometry,
      [mattressInset + offsetX, mattressInset + offsetY, legHeight + baseHeight],
      [width - mattressInset + offsetX, mattressInset + offsetY, legHeight + baseHeight],
      [width - mattressInset + offsetX, length - mattressInset + offsetY, legHeight + baseHeight],
      [mattressInset + offsetX, length - mattressInset + offsetY, legHeight + baseHeight],
      uvMap.mattress
    );
    // Côtés du matelas
    FurnitureGeometryFactory._addQuad(
      geometry,
      [mattressInset + offsetX, mattressInset + offsetY, legHeight + baseHeight],
      [width - mattressInset + offsetX, mattressInset + offsetY, legHeight + baseHeight],
      [width - mattressInset + offsetX, mattressInset + offsetY, legHeight + baseHeight + mattressHeight],
      [mattressInset + offsetX, mattressInset + offsetY, legHeight + baseHeight + mattressHeight],
      uvMap.mattress
    );

    // Tête de lit
    const headboardThickness = 0.02;
    FurnitureGeometryFactory._addQuad(
      geometry,
      [0 + offsetX, length - headboardThickness + offsetY, legHeight],
      [width + offsetX, length - headboardThickness + offsetY, legHeight],
      [width + offsetX, length - headboardThickness + offsetY, legHeight + headHeight],
      [0 + offsetX, length - headboardThickness + offsetY, legHeight + headHeight],
      uvMap.headboard
    );
    // Côtés de la tête de lit
    FurnitureGeometryFactory._addQuad(
      geometry,
      [0 + offsetX, length - headboardThickness + offsetY, legHeight],
      [0 + offsetX, length + offsetY, legHeight],
      [0 + offsetX, length + offsetY, legHeight + headHeight],
      [0 + offsetX, length - headboardThickness + offsetY, legHeight + headHeight],
      uvMap.side
    );
    FurnitureGeometryFactory._addQuad(
      geometry,
      [width + offsetX, length - headboardThickness + offsetY, legHeight],
      [width + offsetX, length + offsetY, legHeight],
      [width + offsetX, length + offsetY, legHeight + headHeight],
      [width + offsetX, length - headboardThickness + offsetY, legHeight + headHeight],
      uvMap.side
    );



    return geometry;
  }
}