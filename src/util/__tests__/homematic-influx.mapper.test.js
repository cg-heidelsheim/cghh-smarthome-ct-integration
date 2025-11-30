const {
  parseGroupStateIntoInfluxDataObject,
  parseDeviceStateChannelIntoInfluxDataObject,
  parseDeviceStateChannelIntoInfluxDataObjectState,
  parseHeatingGroupDataIntoInfluxDataObject,
  parseHeatingThermostatChannelDataIntoInfluxDataObject,
  parseWeatherStateIntoInfluxDataObject
} = require("../homematic-influx.mapper");

describe("homematic-influx.mapper", () => {
  test("parseGroupStateIntoInfluxDataObject parses correctly", () => {
    const input = {
      temperature: 22.5,
      setTemperature: 23.0,
      humidity: 45,
      label: "Living Room"
    };
    const result = parseGroupStateIntoInfluxDataObject(input);
    expect(result).toEqual({
      label: "sensoric",
      values: {
        temperature: 22.5,
        setTemperature: 23.0,
        humidity: 45
      },
      tags: {
        name: "Living_Room",
        type: "HEATING"
      }
    });
  });

  test("parseDeviceStateChannelIntoInfluxDataObject parses correctly", () => {
    const state = { label: "Thermostat 1" };
    const channel = { temperature: 21.0, setTemperature: 22.0, index: 1 };
    const result = parseDeviceStateChannelIntoInfluxDataObject(state, channel);
    expect(result).toEqual({
      label: "sensoric",
      values: {
        temperature: 21.0,
        setTemperature: 22.0
      },
      tags: {
        channel: 1,
        name: "Thermostat_1",
        type: "HEATING_THERMOSTAT"
      }
    });
  });

  test("parseDeviceStateChannelIntoInfluxDataObjectState parses correctly", () => {
    const state = { label: "Thermostat 2" };
    const channel = { valvePosition: 0.75, index: 2 };
    const result = parseDeviceStateChannelIntoInfluxDataObjectState(state, channel);
    expect(result).toEqual({
      label: "sensoric",
      values: {
        valvePosition: 75
      },
      tags: {
        channel: 2,
        name: "Thermostat_2",
        type: "HEATING_THERMOSTAT"
      }
    });
  });

  test("parseHeatingGroupDataIntoInfluxDataObject parses correctly", () => {
    const group = {
      data: {
        label: "Heating Group 1",
        actualTemperature: 20.0,
        setPointTemperature: 21.5,
        humidity: 40
      }
    };
    const result = parseHeatingGroupDataIntoInfluxDataObject(group);
    expect(result).toEqual({
      label: "Heating Group 1",
      values: {
        temperature: 20.0,
        setTemperature: 21.5,
        humidity: 40
      }
    });
  });

  test("parseHeatingThermostatChannelDataIntoInfluxDataObject parses correctly", () => {
    const device = { data: { label: "Thermostat Device" } };
    const channel = {
      setPointTemperature: 19.5,
      valveActualTemperature: 18.0,
      index: 0
    };
    const result = parseHeatingThermostatChannelDataIntoInfluxDataObject(device, channel);
    expect(result).toEqual({
      label: "Thermostat Device",
      values: {
        temperature: 18.0,
        setTemperature: 19.5
      },
      tags: {
        channel: 0
      }
    });
  });

  test("parseWeatherStateIntoInfluxDataObject parses correctly", () => {
    const input = {
      label: "Outdoor Weather",
      temperature: 15.0,
      minTemperature: 10.0,
      maxTemperature: 20.0,
      windSpeed: 5.5,
      vaporAmount: 1.2,
      humidity: 50
    };
    const result = parseWeatherStateIntoInfluxDataObject(input);
    expect(result).toEqual({
      label: "Outdoor Weather",
      values: {
        temperature: 15.0,
        humidity: 50,
        minTemperature: 10.0,
        maxTemperature: 20.0,
        windSpeed: 5.5,
        vaporAmount: 1.2
      }
    });
  });
});
