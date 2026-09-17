const {GroupStateBuilder} = require('../../../src/homematic/group/group-state.builder');

describe('GroupStateBuilder', () => {
  describe('fromHomematicGroup', () => {
    it('maps the HMIP group fields onto a GroupState', () => {
      const group = {
        id: 'g1',
        label: 'Saal',
        actualTemperature: 19.5,
        setPointTemperature: 21,
        humidity: 45,
      };

      const state = GroupStateBuilder.fromHomematicGroup(group);

      expect(state.id).toBe('g1');
      expect(state.label).toBe('Saal');
      expect(state.temperature).toBe(19.5);
      expect(state.setTemperature).toBe(21);
      expect(state.humidity).toBe(45);
    });
  });

  describe('dummyState', () => {
    it('builds a placeholder state labeled INIT', () => {
      const state = GroupStateBuilder.dummyState('g1');

      expect(state.id).toBe('g1');
      expect(state.label).toBe('INIT');
    });
  });
});
