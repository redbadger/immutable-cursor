/**
 *  Copyright (c) 2014-2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import {valToKeyPath, makeCursor} from './utils';
import { createAtom } from 'js-atom';

function cursorFrom(data, keyPath, onChange) {
  const atom = createAtom(data);
  if (arguments.length === 1) {
    keyPath = [];
  } else if (typeof keyPath === 'function') {
    onChange = keyPath;
    keyPath = [];
  } else {
    keyPath = valToKeyPath(keyPath);
  }
  typeof onChange !== 'undefined' && atom.addWatch('onChange', onChange);

  return makeCursor(atom.deref(data), keyPath, atom.swap);
}

exports.from = cursorFrom;
