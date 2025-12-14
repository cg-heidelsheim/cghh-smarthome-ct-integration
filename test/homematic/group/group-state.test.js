const { GroupState } = require('../../../src/db/model/group-state');

describe('GroupState.equalsValueAttributes', () => {
  let stateA;
  let stateB;

  beforeEach(() => {
    stateA = new GroupState();
    stateB = new GroupState();

    stateA.temperature = 20;
    stateA.setTemperature = 22;
    stateA.humidity = 50;
    stateA.id = "id1";
    stateA.label = "Label1";

    stateB.temperature = 20;
    stateB.setTemperature = 22;
    stateB.humidity = 50;
    stateB.id = "id2";   // Different id to verify it's not compared
    stateB.label = "Label2"; // Different label as well
  });

  test('returns true if all compared value attributes are identical', () => {
    expect(stateA.equalsValueAttributes(stateB)).toBe(true);
  });

  test('returns false if temperature differs', () => {
    stateB.temperature = 21;
    expect(stateA.equalsValueAttributes(stateB)).toBe(false);
  });

  test('returns false if setTemperature differs', () => {
    stateB.setTemperature = 23;
    expect(stateA.equalsValueAttributes(stateB)).toBe(false);
  });

  test('returns false if humidity differs', () => {
    stateB.humidity = 55;
    expect(stateA.equalsValueAttributes(stateB)).toBe(false);
  });

  test('returns false if other object is null or undefined', () => {
    expect(stateA.equalsValueAttributes(null)).toBe(false);
    expect(stateA.equalsValueAttributes(undefined)).toBe(false);
  });
});
