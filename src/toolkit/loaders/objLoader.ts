export async function loadObj(url: string) {
  return fetch(url).then(async (resp) => {
    return resp.text().then((data) => {
      return process(data);
    });
  });
}

/*
 *   A WIP obj loader based on OBJLoader from threejs
 *
 *   https://github.com/mrdoob/three.js/blob/dev/examples/js/loaders/OBJLoader.js
 */
function process(text: string) {
  // replace \r\n with \n
  if (text.indexOf('\r\n') !== -1) {
    text = text.replace(/\r\n/g, '\n');
  }

  // join lines separated by a line continuation character (\)
  if (text.indexOf('\\\n') !== -1) {
    text = text.replace(/\\\n/g, '');
  }

  const lines = text.split('\n');

  let line, firstChar;
  let vertices = [];
  let faces = [];
  for (let i = 0; i < lines.length; i++) {
    line = lines[i].trimStart();
    if (line.length === 0) continue;

    firstChar = line.charAt(0);
    if (firstChar === '#') continue;

    if (firstChar === 'v') {
      const data = line.split(/\s+/);

      if (data[0] === 'v') {
        vertices.push(parseFloat(data[1]), parseFloat(data[2]), parseFloat(data[3]));
      }
    } else if (firstChar === 'f') {
      const lineData = line.slice(1).trim();
      const vertexData = lineData.split(/\s+/);
      const faceVertices: string[][] = [];

      for (let j = 0; j < vertexData.length; ++j) {
        const vertex = vertexData[j];

        if (vertex.length > 0) {
          const vertexParts = vertex.split('/');
          faceVertices.push(vertexParts);
        }
      }

      // Draw an edge between the first vertex and all subsequent vertices to form an n-gon
      const v1 = faceVertices[0];
      let v2: string[];
      let v3: string[];

      for (let j = 1; j < faceVertices.length - 1; ++j) {
        v2 = faceVertices[j];
        v3 = faceVertices[j + 1];

        faces.push(parseInt(v1[0], 10) - 1, parseInt(v2[0], 10) - 1, parseInt(v3[0], 10) - 1);
      }
    }
  }

  return {
    vertices: Float64Array.from(vertices),
    faces: Uint32Array.from(faces),
  };
}
