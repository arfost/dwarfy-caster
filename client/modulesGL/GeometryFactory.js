export class GeometryFactory {

  static _addFace(geometry, x1, y1, z1, x2, y2, z2, x3, y3, z3, x4, y4, z4, tintColor, texIndex) {
    geometry.positions.push(
      x1, y1, z1, // Coin inférieur gauche
      x2, y2, z2, // Coin inférieur droit
      x3, y3, z3, // Coin supérieur droit
      x4, y4, z4  // Coin supérieur gauche
    );

    // Coordonnées de texture
    geometry.textureCoordinates.push(
      0.0, 1.0,
      1.0, 1.0,
      1.0, 0.0,
      0.0, 0.0
    );

    // Indices de texture et couleurs
    for (let i = 0; i < 4; i++) {
      if(texIndex !== undefined){
        geometry.textureIndices.push(texIndex);
      }
      geometry.colors.push(...tintColor);
    }

    // Indices pour les triangles
    geometry.indices.push(
      geometry.indexOffset, geometry.indexOffset + 1, geometry.indexOffset + 2,
      geometry.indexOffset, geometry.indexOffset + 2, geometry.indexOffset + 3
    );
    geometry.indexOffset += 4;
  }

  static getLiquidGeometry(geometry, x, y, z, liquidColor, height, faceEast, faceWest, faceNorth, faceSouth, faceAbove) {
    // Normaliser la hauteur (1-7) en valeur entre 0 et 1
    const normalizedHeight = height / 7.0;
    const alpha = 0.3 + (normalizedHeight * 0.5);
    const tint = [...liquidColor, alpha];

    if(faceEast) {
      GeometryFactory._addFace(
        geometry,
        x + 1, y, z + normalizedHeight,
        x + 1, y + 1, z + normalizedHeight,
        x + 1, y + 1, z,
        x + 1, y, z,
        tint
      );
    }
    if(faceWest) {
      GeometryFactory._addFace(
        geometry,
        x, y, z + normalizedHeight,
        x, y + 1, z + normalizedHeight,
        x, y + 1, z,
        x, y, z,
        tint
      );
    }
    if(faceNorth) {
      GeometryFactory._addFace(
        geometry,
        x, y + 1, z + normalizedHeight,
        x + 1, y + 1, z + normalizedHeight,
        x + 1, y + 1, z,
        x, y + 1, z,
        tint
      );
    }
    if(faceSouth) {
      GeometryFactory._addFace(
        geometry,
        x, y, z + normalizedHeight,
        x + 1, y, z + normalizedHeight,
        x + 1, y, z,
        x, y, z,
        tint
      );
    }
    if(faceAbove) {
      GeometryFactory._addFace(
        geometry,
        x, y, z + normalizedHeight,
        x + 1, y, z + normalizedHeight,
        x + 1, y + 1, z + normalizedHeight,
        x, y + 1, z + normalizedHeight,
        tint
      );
    }
  
    return geometry;
  }

  static getFloorGeometry(geometry, x, y, z, texIndex, tintColor) {

    // Ajouter une face de sol
    GeometryFactory._addFace(
      geometry,
      x, y, z,
      x + 1, y, z,
      x + 1, y + 1, z,
      x, y + 1, z,
      tintColor,
      texIndex
    );

    return geometry;
  }

  static getWallGeometry(geometry, x, y, z, texIndex, tintColor, heightRatio, map) {
    // Vérifier les blocs adjacents
    const blockNorth = (map.getBlock(x, y + 1, z) || {}).wallTexture;
    const blockSouth = (map.getBlock(x, y - 1, z) || {}).wallTexture;
    const blockEast = (map.getBlock(x + 1, y, z) || {}).wallTexture;
    const blockWest = (map.getBlock(x - 1, y, z) || {}).wallTexture;

    const zBottom = z;
    const zTop = z + heightRatio;
  
    // Si pas de bloc au nord et au sud, placer le mur est-ouest
    if (!blockNorth && !blockSouth) {
      GeometryFactory._addFace(
        geometry,
        x, y + 0.5, zBottom,     // Coin inférieur gauche
        x + 1, y + 0.5, zBottom, // Coin inférieur droit
        x + 1, y + 0.5, zTop,    // Coin supérieur droit
        x, y + 0.5, zTop,         // Coin supérieur gauche
        tintColor,  
        texIndex
      );
    }
    // Si pas de bloc à l'est et à l'ouest, placer le mur nord-sud
    else if (!blockEast && !blockWest) {
      GeometryFactory._addFace(
        geometry,
        x + 0.5, y, zBottom,     // Coin inférieur gauche
        x + 0.5, y + 1, zBottom, // Coin inférieur droit
        x + 0.5, y + 1, zTop,    // Coin supérieur droit
        x + 0.5, y, zTop,         // Coin supérieur gauche
        tintColor,
        texIndex
      );
    }
    // Cas spéciaux où il y a des blocs des deux côtés opposés
    else {
      // Détecter si le mur fait partie d'un coin
      const isCorner = (blockNorth || blockSouth) && (blockEast || blockWest);
      
      if (isCorner) {
        // Si c'est un coin, placer les deux segments de mur perpendiculaires
        if (!blockNorth) {
          GeometryFactory._addFace(
            geometry,
            x, y + 0.5, zBottom,
            x + 1, y + 0.5, zBottom,
            x + 1, y + 0.5, zTop,
            x, y + 0.5, zTop,         // Coin supérieur gauche
            tintColor,
            texIndex
          );
        }
        if (!blockEast) {
          GeometryFactory._addFace(
            geometry,
            x + 0.5, y, zBottom,
            x + 0.5, y + 1, zBottom,
            x + 0.5, y + 1, zTop,
            x + 0.5, y, zTop,         // Coin supérieur gauche
            tintColor,
            texIndex
          );
        }
      } else {
        // Sinon, orienter le mur dans la direction qui a le moins de blocs adjacents
        const verticalBlocks = (blockNorth ? 1 : 0) + (blockSouth ? 1 : 0);
        const horizontalBlocks = (blockEast ? 1 : 0) + (blockWest ? 1 : 0);
  
        if (verticalBlocks <= horizontalBlocks) {
          GeometryFactory._addFace(
            geometry,
            x, y + 0.5, zBottom,
            x + 1, y + 0.5, zBottom,
            x + 1, y + 0.5, zTop,
            x, y + 0.5, zTop,         // Coin supérieur gauche
            tintColor,
            texIndex
          );
        } else {
          GeometryFactory._addFace(
            geometry,
            x + 0.5, y, zBottom,
            x + 0.5, y + 1, zBottom,
            x + 0.5, y + 1, zTop,
            x + 0.5, y, zTop,         // Coin supérieur gauche
            tintColor,
            texIndex
          );
        }
      }
    }
  
    return geometry;
  }

  static getBlocGeometry(geometry, x, y, z, texIndex, tintColor, heightRatio) {

    const zBottom = z;
    const zTop = z + heightRatio; // Utiliser le heightRatio stocké

    // Face avant (plan y + 1)
    GeometryFactory._addFace(
      geometry,
      x, y + 1, zBottom, // Coin inférieur gauche
      x + 1, y + 1, zBottom, // Coin inférieur droit
      x + 1, y + 1, zTop,    // Coin supérieur droit
      x, y + 1, zTop,     // Coin supérieur gauche
      tintColor,
      texIndex
    );
    // Face arrière
    GeometryFactory._addFace(
      geometry,
      x, y, zBottom, // Coin inférieur gauche
      x + 1, y, zBottom, // Coin inférieur droit
      x + 1, y, zTop,    // Coin supérieur droit
      x, y, zTop,     // Coin supérieur gauche
      tintColor,
      texIndex
    );
    // Face supérieure
    GeometryFactory._addFace(
      geometry,
      x, y, zTop, // Coin arrière gauche
      x + 1, y, zTop, // Coin arrière droit
      x + 1, y + 1, zTop, // Coin avant droit
      x, y + 1, zTop,     // Coin supérieur gauche
      tintColor,
      texIndex
    );
    // // Face inférieure (peut être omise si non visible)
    GeometryFactory._addFace(
      geometry,
      x,     y,     zBottom, // Coin arrière gauche
      x + 1, y,     zBottom, // Coin arrière droit
      x + 1, y + 1, zBottom, // Coin avant droit
      x,     y + 1, zBottom,     // Coin supérieur gauche
      tintColor,
      texIndex
    );
    // Face droite
    GeometryFactory._addFace(
      geometry,
      x + 1, y, zBottom, // Coin inférieur arrière
      x + 1, y + 1, zBottom, // Coin inférieur avant
      x + 1, y + 1, zTop,    // Coin supérieur avant
      x + 1, y, zTop,     // Coin supérieur gauche
      tintColor,
      texIndex
    );
    // Face gauche
    GeometryFactory._addFace(
      geometry,
      x, y, zBottom, // Coin inférieur arrière
      x, y + 1, zBottom, // Coin inférieur avant
      x, y + 1, zTop,    // Coin supérieur avant
      x, y, zTop,     // Coin supérieur gauche
      tintColor,
      texIndex
    );

    return geometry;
  }
}