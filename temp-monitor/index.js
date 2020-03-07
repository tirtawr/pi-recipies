const mcpadc = require('mcp-spi-adc')
const i2c = require('i2c-bus');
const i2cBus = i2c.openSync(1);
const screen = require('oled-i2c-bus');
const font = require('oled-font-5x7');


const sampleRate = { speedHz: 20000 }
let device = {}
let supplyVoltage = 3.3
let resolution = 1.0

var oled = new screen(i2cBus, {
    width: 128,
    height: 64,
    address: 0x3C
});


const temperatureSensor = mcpadc.open(0, sampleRate, addNewChannel)

function addNewChannel(error) {
    if (error) throw error
}

function readTemperatureSensor() {
    temperatureSensor.read((error, reading) => {
        if (error) throw error;
        let temperature = (reading.value * supplyVoltage - 0.5) * 100;
        const now = new Date()
        let text = `Temperature reading -> ${temperature}\n`
        text += `Last Reading -> ${now}\n`
        printToDisplay(text)
    })
}

function printToDisplay(text) {
    oled.clearDisplay()
    oled.setCursor(0, 0)
    oled.writeString(font, 1, text, 1, true)
}

readTemperatureSensor()