// Copyright (c) 2019 Uber Technologies, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {getXvizConfig} from '../config/xviz-config';
import {normalizeXvizPrimitive} from './parse-xviz-primitive';

export const PRIMITIVE_CAT = {
  LOOKAHEAD: 'lookAheads',
  FEATURE: 'features',
  LABEL: 'labels',
  POINTCLOUD: 'pointCloud',
  COMPONENT: 'components'
};

function createPrimitiveMap() {
  const result = {};
  for (const key in PRIMITIVE_CAT) {
    result[PRIMITIVE_CAT[key]] = [];
  }
  return result;
}

// Handle stream-sliced data, via the ETL flow.
export function parseXvizStream(data, convertPrimitive) {
  // data is an array of objects
  // Each object is [{primitives, variables, timestamp},...]
  // Each object represents a timestamp and array of objects

  const {primitives, variables, futures} = data[0];
  // At this point, we either have one or the other.
  // TODO(twojtasz): BUG: there is an assumption that
  // streamNames will be unique.  Need to put in a detection if
  // that is violated.
  if (primitives) {
    const streamName = Object.keys(primitives)[0];
    return data.map(datum =>
      parseStreamPrimitive(
        datum.primitives[streamName],
        streamName,
        datum.timestamp,
        convertPrimitive
      )
    );
  } else if (variables) {
    const streamName = Object.keys(variables)[0];
    return data.map(datum =>
      parseStreamVariable(datum.variables[streamName], streamName, datum.timestamp)
    );
  } else if (futures) {
    const streamName = Object.keys(futures)[0];
    return data.map(datum =>
      parseStreamFutures(datum.futures[streamName], streamName, datum.timestamp, convertPrimitive)
    );
  }

  return {};
}

/* eslint-disable max-depth, max-statements */

/* Processes an individual primitive time sample and converts the
 * data to UI elements.
 */
export function parseStreamPrimitive(objects, streamName, time, convertPrimitive) {
  const {observeObjects, preProcessPrimitive, PRIMITIVE_SETTINGS} = getXvizConfig();

  if (!Array.isArray(objects)) {
    return {};
  }

  observeObjects(streamName, objects, time);
  const primitiveMap = createPrimitiveMap();

  let category = null;
  // Primitives are an array of XVIZ objects
  for (let objectIndex = 0; objectIndex < objects.length; objectIndex++) {
    const object = objects[objectIndex];

    // array of primitives
    if (object && Array.isArray(object)) {
      category = PRIMITIVE_CAT.LOOKAHEAD;
      primitiveMap[category].push([]);

      for (let j = 0; j < object.length; j++) {
        // Apply custom XVIZ pre processing to this primitive
        preProcessPrimitive({primitive: object[j], streamName, time});

        // process each primitive
        const primitive = normalizeXvizPrimitive(
          PRIMITIVE_SETTINGS,
          object[j],
          objectIndex,
          streamName,
          time,
          convertPrimitive
        );
        if (primitive) {
          primitiveMap[category][objectIndex].push(primitive);
        }
      }
    } else {
      // single primitive

      // Apply custom XVIZ postprocessing to this primitive
      preProcessPrimitive({primitive: object, streamName, time});

      // normalize primitive
      category = PRIMITIVE_SETTINGS[object.type].category;
      const primitive = normalizeXvizPrimitive(
        PRIMITIVE_SETTINGS,
        object,
        objectIndex,
        streamName,
        time,
        convertPrimitive
      );
      if (primitive) {
        primitiveMap[category].push(primitive);
      }
    }
  }

  primitiveMap.pointCloud = joinObjectPointCloudsToTypedArrays(primitiveMap.pointCloud);
  primitiveMap.time = time;

  return primitiveMap;
}

/* eslint-enable max-depth, max-statements */

/* Processes the futures and converts the
 * data to UI elements.
 */
export function parseStreamFutures(objects, streamName, time, convertPrimitive) {
  const {PRIMITIVE_SETTINGS} = getXvizConfig();
  const futures = [];
  // objects = array of objects
  // [{timestamp, primitives[]}, ...]

  // Futures are an array of array of primitives
  // TODO(twojtasz): objects indexes represent the
  //     represent an index into time, so they cannot be removed
  //     if empty.
  objects.forEach((object, objectIndex) => {
    const {primitives} = object;

    // TODO(twojtasz): only geometric primitives are supported
    // for now.  Text and point clouds are not handled
    // TODO(twojtasz): addThickness is temporary to use XVIZ thickness
    //                 on polygons.
    const future = primitives
      .map(primitive =>
        normalizeXvizPrimitive(
          PRIMITIVE_SETTINGS,
          primitive,
          objectIndex,
          streamName,
          time,
          convertPrimitive
        )
      )
      .filter(Boolean);

    futures.push(future);
  });

  return {
    time,
    lookAheads: futures
  };
}

/* Processes an individual variable time sample and converts the
 * data to UI elements.
 */
export function parseStreamVariable(objects, streamName, time) {
  const isVar = !Array.isArray(objects);
  if (!isVar) {
    return {};
  }

  let variable;
  const {timestamps, values} = objects;
  if (values.length === 1) {
    variable = values[0];
  } else {
    variable = values.map((v, i) => [timestamps[i], v]);
  }

  return {
    time,
    variable
  };
}

function getVertexCount(vertices) {
  if (vertices instanceof Float32Array) {
    return vertices.length / 3;
  } else {
    return vertices.length;
  }
}

// Joins a set of point clouds extracted from objects into a single point cloud
// generates typed arrays that can be displayed efficiently by deck.gl
function joinObjectPointCloudsToTypedArrays(objects) {
  if (objects.length === 0) {
    return null;
  }

  // Assume 3 values (x, y, z) in flattened array
  const countOfValuesPerPointInFlattenedArray = 3;

  let numInstances = 0;
  for (const object of objects) {
    numInstances += getVertexCount(object.vertices);
  }

  const positions = new Float32Array(numInstances * 3);
  const colors = new Uint8ClampedArray(numInstances * 4);
  const normals = new Float32Array(numInstances * 3);

  // Store object ids to enable recoloring.
  // NOTE: Not a vertex attribute, ids are just efficiently stored as as 32 bit integers...
  const ids = new Uint32Array(numInstances);

  objects.forEach(object => {
    const vertexCount = getVertexCount(object.vertices);
    const isFloat32Array = object.vertices instanceof Float32Array;

    for (let i = 0; i < vertexCount; i++) {
      let vertex = object.vertices[i];

      if (isFloat32Array) {
        vertex = [];
        vertex[0] = object.vertices[i * 3 + 0];
        vertex[1] = object.vertices[i * 3 + 1];
        vertex[2] = object.vertices[i * 3 + 2];
      }

      ids[i] = object.id;

      positions[i * 3 + 0] = vertex[0];
      positions[i * 3 + 1] = vertex[1];
      positions[i * 3 + 2] = vertex[2];

      colors[i * 4 + 0] = object.color[0];
      colors[i * 4 + 1] = object.color[1];
      colors[i * 4 + 2] = object.color[2];
      colors[i * 4 + 3] = object.color[3] || 255;

      normals[i * 3 + 0] = 0;
      normals[i * 3 + 1] = 1;
      normals[i * 3 + 2] = 0;
    }
  });

  return {
    // track type so we can handle 2d & 3d clouds
    type: objects[0].type,
    numInstances,
    positions,
    colors,
    normals,
    ids
  };
}