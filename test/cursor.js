import Immutable from 'immutable';
import Cursor from './../src/cursor';

import {expect} from 'chai';
import sinon from 'sinon';

describe('Cursor', () => {
  const json = { a: { b: { c: 1 } } };

  it('gets from its path', () => {
    const data = Immutable.fromJS(json);
    const cursor = Cursor.from(data);

    expect(cursor.deref()).to.equal(data);

    const deepCursor = cursor.cursor(['a', 'b']);
    expect(deepCursor.deref().toJS()).to.deep.equal(json.a.b);
    expect(deepCursor.deref()).to.equal(data.getIn(['a', 'b']));
    expect(deepCursor.get('c')).to.equal(1);

    const leafCursor = deepCursor.cursor('c');
    expect(leafCursor.deref()).to.equal(1);

    const missCursor = leafCursor.cursor('d');
    expect(missCursor.deref()).to.equal(undefined);
  });

  it('gets return new cursors', () => {
    const data = Immutable.fromJS(json);
    const cursor = Cursor.from(data);
    const deepCursor = cursor.getIn(['a', 'b']);
    expect(deepCursor.deref()).to.equal(data.getIn(['a', 'b']));
  });

  it('gets return new cursors using List', () => {
    const data = Immutable.fromJS(json);
    const cursor = Cursor.from(data);
    const deepCursor = cursor.getIn(Immutable.fromJS(['a', 'b']));
    expect(deepCursor.deref()).to.equal(data.getIn(Immutable.fromJS(['a', 'b'])));
  });

  it('cursor return new cursors of correct type', () => {
    const data = Immutable.fromJS({ a: [1, 2, 3] });
    const cursor = Cursor.from(data);
    const deepCursor = cursor.cursor('a');
    expect(deepCursor.findIndex).to.exist;
  });

  it('can be treated as a value', () => {
    const data = Immutable.fromJS(json);
    const cursor = Cursor.from(data, ['a', 'b']);
    expect(cursor.toJS()).to.deep.equal(json.a.b);
    expect(Immutable.is(cursor, data.getIn(['a', 'b']))).to.be.true;
    expect(cursor.size).to.equal(1);
    expect(cursor.get('c')).to.equal(1);
  });

  it('can be value compared to a primitive', () => {
    const data = Immutable.Map({ a: 'A' });
    const aCursor = Cursor.from(data, 'a');
    expect(aCursor.size).to.be.undefined;
    expect(aCursor.deref()).to.equal('A');
    expect(Immutable.is(aCursor, 'A')).to.be.true;
  });

  it('updates at its path', () => {
    const onChange = sinon.spy();

    const data = Immutable.fromJS(json);
    const aCursor = Cursor.from(data, 'a', onChange);

    const deepCursor = aCursor.cursor(['b', 'c']);
    expect(deepCursor.deref()).to.equal(1);

    // cursor edits return new cursors:
    const newDeepCursor = deepCursor.update(x => x + 1);
    expect(newDeepCursor.deref()).to.equal(2);

    // We're unable to use `spyCall.calledWith()` here due to limitations in
    // Chai's deep recursive value-based equality.
    expect(Immutable.is(
      onChange.args[0][0],
      Immutable.fromJS({a:{b:{c:2}}})
    )).to.be.true;
    expect(Immutable.is(
      onChange.args[0][1],
      data
    )).to.be.true;
    expect(onChange.args[0][2]).to.deep.equal(['a', 'b', 'c']);

    const newestDeepCursor = newDeepCursor.update(x => x + 1);
    expect(newestDeepCursor.deref()).to.equal(3);

    expect(Immutable.is(
      onChange.args[1][0],
      Immutable.fromJS({a:{b:{c:3}}})
    )).to.be.true;
    expect(Immutable.is(
      onChange.args[1][1],
      Immutable.fromJS({a:{b:{c:2}}})
    )).to.be.true;
    expect(onChange.args[1][2]).to.deep.equal(['a', 'b', 'c']);

    // meanwhile, data is still immutable:
    expect(data.toJS()).to.deep.equal(json);

    // as is the original cursor.
    expect(deepCursor.deref()).to.equal(3);
    const otherNewDeepCursor = deepCursor.update(x => x + 10);
    expect(otherNewDeepCursor.deref()).to.equal(13);

    expect(Immutable.is(
      onChange.args[2][0],
      Immutable.fromJS({a:{b:{c:13}}})
    )).to.be.true;
    expect(Immutable.is(
      onChange.args[2][1],
      data.setIn(['a', 'b', 'c'], 3)
    )).to.be.true;
    expect(onChange.args[2][2]).to.deep.equal(['a', 'b', 'c']);

    // and update has been called exactly thrice.
    expect(onChange.callCount).to.equal(3);
  });

  it('updates with the return value of onChange', () => {
    const onChange = sinon.stub();

    onChange
      .onFirstCall().returns(undefined)
      .onSecondCall().returns(Immutable.fromJS({a:{b:{c:11}}}));

    const data = Immutable.fromJS(json);
    const deepCursor = Cursor.from(data, ['a', 'b', 'c'], onChange);

    // onChange returning undefined has no effect
    let newCursor = deepCursor.update(x => x + 1);
    expect(newCursor.deref()).to.equal(2);

    expect(Immutable.is(
      onChange.args[0][0],
      Immutable.fromJS({a:{b:{c:2}}})
    )).to.be.true;
    expect(Immutable.is(
      onChange.args[0][1],
      data
    )).to.be.true;
    expect(onChange.args[0][2]).to.deep.equal(['a', 'b', 'c']);

    // onChange returning something else has an effect
    newCursor = newCursor.update(function() { return 999; });
    expect(newCursor.deref()).to.equal(11);

    expect(Immutable.is(
      onChange.args[1][0],
      Immutable.fromJS({a:{b:{c:999}}})
    )).to.be.true;
    expect(Immutable.is(
      onChange.args[1][1],
      Immutable.fromJS({a:{b:{c:2}}})
    )).to.be.true;
    expect(onChange.args[0][2]).to.deep.equal(['a', 'b', 'c']);

    // and update has been called exactly twice
    expect(onChange.args[3]).to.be.undefined;
  });

  it('shares root cursor data with other derived cursors', () => {
    const data = Immutable.fromJS({a: 1, b: 2});
    const cursor = Cursor.from(data);

    cursor.set('a', 2);
    const result = cursor.set('b', 3);

    expect(Immutable.is(result.deref(), Immutable.fromJS({'a': 2, 'b': 3}))).to.be.true;
  });

  it('has map API for update shorthand', () => {
    const onChange = sinon.spy();

    const data = Immutable.fromJS(json);
    const aCursor = Cursor.from(data, 'a', onChange);
    const bCursor = aCursor.cursor('b');

    expect(Immutable.is(bCursor.set('c', 10).deref(), Immutable.fromJS({ c: 10 }))).to.be.true;

    expect(Immutable.is(
      onChange.args[0][0],
      Immutable.fromJS({ a: { b: { c: 10 } } })
    )).to.be.true;
    expect(Immutable.is(onChange.args[0][1], data)).to.be.true;
    expect(onChange.args[0][2]).to.deep.equal(['a', 'b', 'c']);
  });

  it('creates maps as necessary', () => {
    const data = Immutable.Map();
    let cursor = Cursor.from(data, ['a', 'b', 'c']);
    expect(cursor.deref()).to.be.undefined;
    cursor = cursor.set('d', 3);
    expect(Immutable.is(cursor.deref(), Immutable.Map({d: 3}))).to.be.true;
  });

  it('can set undefined', () => {
    const data = Immutable.Map();
    let cursor = Cursor.from(data, ['a', 'b', 'c']);
    expect(cursor.deref()).to.be.undefined;
    cursor = cursor.set('d', undefined);
    expect(cursor.toJS()).to.deep.equal({d: undefined});
  });

  it('has the sequence API', () => {
    const data = Immutable.Map({a: 1, b: 2, c: 3});
    const cursor = Cursor.from(data);
    expect(Immutable.is(
      cursor.map((x: number) => x * x),
      Immutable.Map({a: 1, b: 4, c: 9})
    )).to.be.true;
  });

  it('can push values on a List', () => {
    const onChange = sinon.spy();
    const data = Immutable.fromJS({a: {b: [0, 1, 2]}});
    const cursor = Cursor.from(data, ['a', 'b'], onChange);

    expect(Immutable.is(
      cursor.push(3, 4),
      Immutable.List([0, 1, 2, 3, 4])
    )).to.be.true;

    expect(Immutable.is(
      onChange.args[0][0],
      Immutable.fromJS({a: {b: [0, 1, 2, 3, 4]}})
    )).to.be.true;

    expect(Immutable.is(
      onChange.args[0][1],
      data
    )).to.be.true;

    expect(onChange.args[0][2]).to.deep.equal(['a', 'b']);
  });

  it('can pop values of a List', () => {
    const onChange = sinon.spy();
    const data = Immutable.fromJS({a: {b: [0, 1, 2]}});
    const cursor = Cursor.from(data, ['a', 'b'], onChange);

    expect(Immutable.is(
      cursor.pop(),
      Immutable.List([0, 1])
    )).to.be.true;

    expect(Immutable.is(
      onChange.args[0][0],
      Immutable.fromJS({a: {b: [0, 1]}})
    )).to.be.true;

    expect(Immutable.is(
      onChange.args[0][1],
      data
    )).to.be.true;

    expect(onChange.args[0][2]).to.deep.equal(['a', 'b']);
  });

  it('can unshift values on a List', () => {
    const onChange = sinon.spy();
    const data = Immutable.fromJS({a: {b: [0, 1, 2]}});
    const cursor = Cursor.from(data, ['a', 'b'], onChange);

    expect(Immutable.is(
      cursor.unshift(-2, -1),
      Immutable.List([-2, -1, 0, 1, 2])
    )).to.be.true;

    expect(Immutable.is(
      onChange.args[0][0],
      Immutable.fromJS({a: {b: [-2, -1, 0, 1, 2]}})
    )).to.be.true;

    expect(Immutable.is(
      onChange.args[0][1],
      data
    )).to.be.true;

    expect(onChange.args[0][2]).to.deep.equal(['a', 'b']);
  });

  it('can shift values of a List', () => {
    const onChange = sinon.spy();
    const data = Immutable.fromJS({a: {b: [0, 1, 2]}});
    const cursor = Cursor.from(data, ['a', 'b'], onChange);

    expect(Immutable.is(
      cursor.shift(),
      Immutable.List([1, 2])
    )).to.be.true;

    expect(Immutable.is(
      onChange.args[0][0],
      Immutable.fromJS({a: {b: [1, 2]}})
    )).to.be.true;

    expect(Immutable.is(
      onChange.args[0][1],
      data
    )).to.be.true;

    expect(onChange.args[0][2]).to.deep.equal(['a', 'b']);
  });


  it('returns wrapped values for sequence API', () => {
    const data = Immutable.fromJS({a: {v: 1}, b: {v: 2}, c: {v: 3}});
    const onChange = sinon.spy();
    const cursor = Cursor.from(data, onChange);

    let found = cursor.find(map => map.get('v') === 2);
    expect(typeof found.deref).to.equal('function'); // is a cursor!
    found = found.set('v', 20);

    expect(Immutable.is(
      onChange.args[0][0],
      Immutable.fromJS({a: {v: 1}, b: {v: 20}, c: {v: 3}})
    )).to.be.true;

    expect(Immutable.is(
      onChange.args[0][1],
      data
    )).to.be.true;

    expect(onChange.args[0][2]).to.deep.equal(['b', 'v']);
  });

  it('returns wrapped values for iteration API', () => {
    const jsData = [{val: 0}, {val: 1}, {val: 2}];
    const data = Immutable.fromJS(jsData);
    const cursor = Cursor.from(data);
    cursor.forEach(function(c, i) {
      expect(typeof c.deref).to.equal('function'); // is a cursor!
      expect(c.get('val')).to.equal(i);
    });
  });

  it('can map over values to get subcursors', () => {
    const data = Immutable.fromJS({a: {v: 1}, b: {v: 2}, c: {v: 3}});
    const cursor = Cursor.from(data);

    const mapped = cursor.map(val => {
      expect(typeof val.deref).to.equal('function'); // mapped values are cursors.
      return val;
    }).toMap();
    // Mapped is not a cursor, but it is a sequence of cursors.
    expect(typeof (mapped).deref).to.not.equal('function');
    expect(typeof (mapped.get('a')).deref).to.equal('function');

    // Same for indexed cursors
    const data2 = Immutable.fromJS({x: [{v: 1}, {v: 2}, {v: 3}]});
    const cursor2 = Cursor.from(data2);

    const mapped2 = cursor2.get('x').map(val => {
      expect(typeof val.deref).to.equal('function'); // mapped values are cursors.
      return val;
    }).toList();
    // Mapped is not a cursor, but it is a sequence of cursors.
    expect(typeof mapped2.deref).to.not.equal('function');
    expect(typeof mapped2.get(0).deref).to.equal('function');
  });

  it('can have mutations apply with a single callback', () => {
    const onChange = sinon.spy();
    const data = Immutable.fromJS({'a': 1});

    const c1 = Cursor.from(data, onChange);
    const c2 = c1.withMutations(m => m.set('b', 2).set('c', 3).set('d', 4));
    expect(c2.deref().toObject()).to.deep.equal({'a': 1, 'b': 2, 'c': 3, 'd': 4});
    expect(onChange.callCount).to.equal(1);
  });

  it('can use withMutations on an unfulfilled cursor', () => {
    const onChange = sinon.spy();
    const data = Immutable.fromJS({});

    const c1 = Cursor.from(data, ['a', 'b', 'c'], onChange);
    expect(c1.deref()).to.equal(undefined);

    const c2 = c1.withMutations(m => m.set('x', 1).set('y', 2).set('z', 3));

    expect(Immutable.is(c2.deref(), Immutable.fromJS({ x: 1, y: 2, z: 3 })));

    expect(onChange.callCount).to.equal(1);
  });

  it('maintains indexed sequences', () => {
    const data = Immutable.fromJS([]);
    const c = Cursor.from(data);
    expect(c.toJS()).to.deep.equal([]);
  });

  it('properly acts as an iterable', () => {
    const data = Immutable.fromJS({key: {val: 1}});
    const c = Cursor.from(data).values();
    const c1 = c.next().value.get('val');
    expect(c1).to.equal(1);
  });

  it('can update deeply', () => {
    const onChange = sinon.spy();
    const data = Immutable.fromJS({a:{b:{c:1}}});
    const c = Cursor.from(data, ['a'], onChange);
    const c1 = c.updateIn(['b', 'c'], x => x * 10);
    expect(c1.getIn(['b', 'c'])).to.equal(10);

    expect(Immutable.is(
      onChange.args[0][0],
      Immutable.fromJS({a:{b:{c:10}}})
    )).to.be.true;

    expect(Immutable.is(
      onChange.args[0][1],
      data
    )).to.be.true;

    expect(onChange.args[0][2]).to.deep.equal(['a', 'b', 'c']);
  });

  it('can set deeply', () => {
    const onChange = sinon.spy();
    const data = Immutable.fromJS({a:{b:{c:1}}});
    const c = Cursor.from(data, ['a'], onChange);
    const c1 = c.setIn(['b', 'c'], 10);
    expect(c1.getIn(['b', 'c'])).to.equal(10);

    expect(Immutable.is(
      onChange.args[0][0],
      Immutable.fromJS({a:{b:{c:10}}})
    )).to.be.true;

    expect(Immutable.is(
      onChange.args[0][1],
      data
    )).to.be.true;

    expect(onChange.args[0][2]).to.deep.equal(['a', 'b', 'c']);
  });

  it('can get Record value as a property', () => {
    const User = Immutable.Record({ name: 'John' });
    const users = Immutable.List.of(new User());
    const data = Immutable.Map({'users': users});
    const cursor = Cursor.from(data, ['users']);
    expect(cursor.first().name).to.equal('John');
  });

  it('can set value of a cursor directly', () => {
    const onChange = sinon.spy();
    const data = Immutable.fromJS({a:1});
    const c = Cursor.from(data, ['a'], onChange);
    const c1 = c.set(2);
    expect(c1.deref()).to.equal(2);

    expect(Immutable.is(
      onChange.args[0][0],
      Immutable.fromJS({a:2})
    )).to.be.true;

    expect(Immutable.is(
      onChange.args[0][1],
      data
    )).to.be.true;

    expect(onChange.args[0][2]).to.deep.equal(['a']);
  });

  it('can set value of a cursor to undefined directly', () => {
    const onChange = sinon.spy();
    const data = Immutable.fromJS({a:1});
    const c = Cursor.from(data, ['a'], onChange);
    const c1 = c.set(undefined);
    expect(c1.deref()).to.equal(undefined);

    expect(Immutable.is(
      onChange.args[0][0],
      Immutable.fromJS({a:undefined})
    )).to.be.true;

    expect(Immutable.is(
      onChange.args[0][1],
      data
    )).to.be.true;

    expect(onChange.args[0][2]).to.deep.equal(['a']);
  });
});
