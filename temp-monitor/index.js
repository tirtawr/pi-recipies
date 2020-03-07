const mcpadc = require('mcp-spi-adc')
const i2c = require('i2c-bus');
const i2cBus = i2c.openSync(1);
const screen = require('oled-i2c-bus');
const font = require('oled-font-5x7');


const sampleRate = { speedHz: 20000 }
let supplyVoltage = 3.3

var oled = new screen(i2cBus, {
    width: 128,
    height: 64,
    address: 0x3C
});


const temperatureSensor = mcpadc.open(0, sampleRate, addNewChannel)

function addNewChannel(error) {
    if (error) throw error
    readTemperatureSensor()
}

function readTemperatureSensor() {
    temperatureSensor.read((error, reading) => {
        if (error) throw error;
        let temperature = (reading.value * supplyVoltage - 0.5) * 100;
        const now = new Date()
        let text = 'Temperature -> \n'
        text += `${temperature}\n`
        text += '\n'
        text += 'Last Reading -> '
        text += `${now.toLocaleString()}\n`
        printToDisplay(text)
    })
}

function printToDisplay(text) {
    oled.clearDisplay()
    oled.setCursor(0, 0)
    oled.writeString(font, 1, text, 1, true)
}