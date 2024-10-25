export class GeometryFactory {

  static getLiquidTopGeometry({ positions, textureCoordinates, colors, indices, indexOffset }, x, y, z, liquidColor, height) {
    // Normaliser la hauteur (1-7) en valeur entre 0 et 1
    const normalizedHeight = height / 7.0;
    
    // Créer un quad avec la hauteur correspondante
    positions.push(
      x, y, z + normalizedHeight,
      x + 1, y, z + normalizedHeight,
      x + 1, y + 1, z + normalizedHeight,
      x, y + 1, z + normalizedHeight
    );
  
    // Coordonnées de texture pour l'effet de distortion
    textureCoordinates.push(
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0
    );
  
    // Couleur du liquide avec alpha basé sur la hauteur
    const alpha = 0.3 + (normalizedHeight * 0.5); // Plus le liquide est haut, plus il est opaque
    for (let i = 0; i < 4; i++) {
      colors.push(...liquidColor, alpha);
    }
  
    indices.push(
      indexOffset, indexOffset + 1, indexOffset + 2,
      indexOffset, indexOffset + 2, indexOffset + 3
    );
    
    indexOffset += 4;
  
    return {
      positions,
      textureCoordinates,
      colors,
      indices,
      indexOffset
    };
  }

  static getLiquidFrontGeometry({ positions, textureCoordinates, colors, indices, indexOffset }, x, y, z, liquidColor, height) {
    // Normaliser la hauteur (1-7) en valeur entre 0 et 1
    const normalizedHeight = height / 7.0;
    const zBottom = z;
    const zTop = z + normalizedHeight; // Utiliser le heightRatio stocké
    
    // Face avant (plan y + 1)
    positions.push(
      x, y + 1, zBottom, // Coin inférieur gauche
      x + 1, y + 1, zBottom, // Coin inférieur droit
      x + 1, y + 1, zTop,    // Coin supérieur droit
      x, y + 1, zTop     // Coin supérieur gauche
    );
    // Face arrière
    positions.push(
      x, y, zBottom, // Coin inférieur gauche
      x + 1, y, zBottom, // Coin inférieur droit
      x + 1, y, zTop,    // Coin supérieur droit
      x, y, zTop     // Coin supérieur gauche
    );
    // Face supérieure
    positions.push(
      x, y, zTop, // Coin arrière gauche
      x + 1, y, zTop, // Coin arrière droit
      x + 1, y + 1, zTop, // Coin avant droit
      x, y + 1, zTop  // Coin avant gauche
    );
    // // Face inférieure (peut être omise si non visible)
    positions.push(
        x,     y,     zBottom, // Coin arrière gauche
        x + 1, y,     zBottom, // Coin arrière droit
        x + 1, y + 1, zBottom, // Coin avant droit
        x,     y + 1, zBottom  // Coin avant gauche
    );
    // Face droite
    positions.push(
      x + 1, y, zBottom, // Coin inférieur arrière
      x + 1, y + 1, zBottom, // Coin inférieur avant
      x + 1, y + 1, zTop,    // Coin supérieur avant
      x + 1, y, zTop     // Coin supérieur arrière
    );
    // Face gauche
    positions.push(
      x, y, zBottom, // Coin inférieur arrière
      x, y + 1, zBottom, // Coin inférieur avant
      x, y + 1, zTop,    // Coin supérieur avant
      x, y, zTop     // Coin supérieur arrière
    );

    // Coordonnées de texture et couleurs pour chaque face
    for (let i = 0; i < 6; i++) {
      textureCoordinates.push(
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,
        0.0, 0.0
      );
      const alpha = 0.3 + (normalizedHeight * 0.5);
      for (let j = 0; j < 4; j++) {
        colors.push(...liquidColor, alpha);
      }
    }

    // Indices pour les triangles de chaque face
    for (let i = 0; i < 6; i++) {
      const base = indexOffset + i * 4;
      indices.push(
        base, base + 1, base + 2,
        base, base + 2, base + 3
      );
    }
    indexOffset += 24;
  
    return {
      positions,
      textureCoordinates,
      colors,
      indices,
      indexOffset
    };
  }
  

  static getFloorGeometry({ positions, textureCoordinates, textureIndices, colors, indices, indexOffset }, x, y, z, texIndex, tintColor) {


    positions.push(
      x, y, z,
      x + 1, y, z,
      x + 1, y + 1, z,
      x, y + 1, z
    );

    // Coordonnées de texture
    textureCoordinates.push(
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0
    );

    // Indices de texture et couleurs
    for (let i = 0; i < 4; i++) {
      textureIndices.push(texIndex);
      colors.push(...tintColor);
    }

    // Indices pour les triangles
    indices.push(
      indexOffset, indexOffset + 1, indexOffset + 2,
      indexOffset, indexOffset + 2, indexOffset + 3
    );
    indexOffset += 4;

    return {
      positions,
      textureCoordinates,
      textureIndices,
      colors,
      indices,
      indexOffset
    };
  }

  static getWallGeometry({ positions, textureCoordinates, textureIndices, colors, indices, indexOffset }, x, y, z, texIndex, tintColor, heightRatio, map) {
    // Vérifier les blocs adjacents
    const blockNorth = (map.getBlock(x, y + 1, z) || {}).wallTexture;
    const blockSouth = (map.getBlock(x, y - 1, z) || {}).wallTexture;
    const blockEast = (map.getBlock(x + 1, y, z) || {}).wallTexture;
    const blockWest = (map.getBlock(x - 1, y, z) || {}).wallTexture;


  
    const zBottom = z;
    const zTop = z + heightRatio;
  
    // Fonction utilitaire pour ajouter une face de mur
    const addWallFace = (x1, y1, z1, x2, y2, z2, x3, y3, z3, x4, y4, z4) => {
      positions.push(
        x1, y1, z1, // Coin inférieur gauche
        x2, y2, z2, // Coin inférieur droit
        x3, y3, z3, // Coin supérieur droit
        x4, y4, z4  // Coin supérieur gauche
      );
  
      // Coordonnées de texture
      textureCoordinates.push(
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,
        0.0, 0.0
      );
  
      // Indices de texture et couleurs
      for (let i = 0; i < 4; i++) {
        textureIndices.push(texIndex);
        colors.push(...tintColor);
      }
  
      // Indices pour les triangles
      indices.push(
        indexOffset, indexOffset + 1, indexOffset + 2,
        indexOffset, indexOffset + 2, indexOffset + 3
      );
      indexOffset += 4;
    };
  
    // Si pas de bloc au nord et au sud, placer le mur est-ouest
    if (!blockNorth && !blockSouth) {
      addWallFace(
        x, y + 0.5, zBottom,     // Coin inférieur gauche
        x + 1, y + 0.5, zBottom, // Coin inférieur droit
        x + 1, y + 0.5, zTop,    // Coin supérieur droit
        x, y + 0.5, zTop         // Coin supérieur gauche
      );
    }
    // Si pas de bloc à l'est et à l'ouest, placer le mur nord-sud
    else if (!blockEast && !blockWest) {
      addWallFace(
        x + 0.5, y, zBottom,     // Coin inférieur gauche
        x + 0.5, y + 1, zBottom, // Coin inférieur droit
        x + 0.5, y + 1, zTop,    // Coin supérieur droit
        x + 0.5, y, zTop         // Coin supérieur gauche
      );
    }
    // Cas spéciaux où il y a des blocs des deux côtés opposés
    else {
      // Détecter si le mur fait partie d'un coin
      const isCorner = (blockNorth || blockSouth) && (blockEast || blockWest);
      
      if (isCorner) {
        // Si c'est un coin, placer les deux segments de mur perpendiculaires
        if (!blockNorth) {
          addWallFace(
            x, y + 0.5, zBottom,
            x + 1, y + 0.5, zBottom,
            x + 1, y + 0.5, zTop,
            x, y + 0.5, zTop
          );
        }
        if (!blockEast) {
          addWallFace(
            x + 0.5, y, zBottom,
            x + 0.5, y + 1, zBottom,
            x + 0.5, y + 1, zTop,
            x + 0.5, y, zTop
          );
        }
      } else {
        // Sinon, orienter le mur dans la direction qui a le moins de blocs adjacents
        const verticalBlocks = (blockNorth ? 1 : 0) + (blockSouth ? 1 : 0);
        const horizontalBlocks = (blockEast ? 1 : 0) + (blockWest ? 1 : 0);
  
        if (verticalBlocks <= horizontalBlocks) {
          addWallFace(
            x, y + 0.5, zBottom,
            x + 1, y + 0.5, zBottom,
            x + 1, y + 0.5, zTop,
            x, y + 0.5, zTop
          );
        } else {
          addWallFace(
            x + 0.5, y, zBottom,
            x + 0.5, y + 1, zBottom,
            x + 0.5, y + 1, zTop,
            x + 0.5, y, zTop
          );
        }
      }
    }
  
    return {
      positions,
      textureCoordinates,
      textureIndices,
      colors,
      indices,
      indexOffset
    };
  }

  static getBlocGeometry({ positions, textureCoordinates, textureIndices, colors, indices, indexOffset }, x, y, z, texIndex, tintColor, heightRatio) {

    const zBottom = z;
    const zTop = z + heightRatio; // Utiliser le heightRatio stocké
    // Face avant (plan y + 1)
    positions.push(
      x, y + 1, zBottom, // Coin inférieur gauche
      x + 1, y + 1, zBottom, // Coin inférieur droit
      x + 1, y + 1, zTop,    // Coin supérieur droit
      x, y + 1, zTop     // Coin supérieur gauche
    );
    // Face arrière
    positions.push(
      x, y, zBottom, // Coin inférieur gauche
      x + 1, y, zBottom, // Coin inférieur droit
      x + 1, y, zTop,    // Coin supérieur droit
      x, y, zTop     // Coin supérieur gauche
    );
    // Face supérieure
    positions.push(
      x, y, zTop, // Coin arrière gauche
      x + 1, y, zTop, // Coin arrière droit
      x + 1, y + 1, zTop, // Coin avant droit
      x, y + 1, zTop  // Coin avant gauche
    );
    // // Face inférieure (peut être omise si non visible)
    positions.push(
        x,     y,     zBottom, // Coin arrière gauche
        x + 1, y,     zBottom, // Coin arrière droit
        x + 1, y + 1, zBottom, // Coin avant droit
        x,     y + 1, zBottom  // Coin avant gauche
    );
    // Face droite
    positions.push(
      x + 1, y, zBottom, // Coin inférieur arrière
      x + 1, y + 1, zBottom, // Coin inférieur avant
      x + 1, y + 1, zTop,    // Coin supérieur avant
      x + 1, y, zTop     // Coin supérieur arrière
    );
    // Face gauche
    positions.push(
      x, y, zBottom, // Coin inférieur arrière
      x, y + 1, zBottom, // Coin inférieur avant
      x, y + 1, zTop,    // Coin supérieur avant
      x, y, zTop     // Coin supérieur arrière
    );

    // Coordonnées de texture et couleurs pour chaque face
    for (let i = 0; i < 6; i++) {
      textureCoordinates.push(
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,
        0.0, 0.0
      );
      for (let j = 0; j < 4; j++) {
        textureIndices.push(texIndex);
        colors.push(...tintColor);
      }
    }

    // Indices pour les triangles de chaque face
    for (let i = 0; i < 6; i++) {
      const base = indexOffset + i * 4;
      indices.push(
        base, base + 1, base + 2,
        base, base + 2, base + 3
      );
    }
    indexOffset += 24;

    return {
      positions,
      textureCoordinates,
      textureIndices,
      colors,
      indices,
      indexOffset
    };
  }
}