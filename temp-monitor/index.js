const mcpadc = require('mcp-spi-adc')
const i2c = require('i2c-bus')
const i2cBus = i2c.openSync(1)
const screen = require('oled-i2c-bus')
const font = require('oled-font-5x7')
const fs = require('fs')
const path = require("path")
var request = require('request')
let rawSecrets = fs.readFileSync(path.resolve(__dirname, 'secrets.json'))
let secrets = JSON.parse(rawSecrets)


const sampleRate = { speedHz: 20000 }
let supplyVoltage = 3.3

var oled = new screen(i2cBus, {
    width: 128,
    height: 64,
    address: 0x3C
})


const temperatureSensor = mcpadc.open(0, sampleRate, addNewChannel)

function addNewChannel(error) {
    if (error) throw error
    readTemperatureSensor()
}

function readTemperatureSensor() {
    temperatureSensor.read((error, reading) => {
        if (error) throw error;
        let temperature = (reading.value * supplyVoltage - 0.5) * 100;
        sendRequest(temperature)
        const now = new Date()
        let text = 'Temperature -> \n'
        text += `${temperature}\n`
        text += '\n'
        text += 'Last Reading -> '
        text += `${now.toLocaleString()}\n`
        printToDisplay(text)
        
    })
}

function sendRequest(temperature) {
    request({
        'method': 'POST',
        'url': 'https://tigoe.io/data',
        'headers': {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        form: {
            'macAddress': secrets.mac_address,
            'sessionKey': secrets.session_key,
            'data': JSON.stringify({
                temperature: temperature,
                temperature_unit: 'celcius',
                device_id: 'pi_zero_w_1',
                device_timestamp: new Date()
            })
        }
    }, function (error, response) {
        if (error) throw new Error(error);
        console.log(response.body);
    });

}

function printToDisplay(text) {
    oled.clearDisplay()
    oled.setCursor(0, 0)
    oled.writeString(font, 1, text, 1, true)
}