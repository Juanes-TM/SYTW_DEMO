// t-e2e/scripts-js/diagnostico.spec.js
const { Builder, By, Key, until } = require('selenium-webdriver')
const assert = require('assert')
const firefox = require('selenium-webdriver/firefox')

describe('Diagnostico', function() {
  jest.setTimeout(60000)
  let driver
  
  beforeEach(async function() {
    const options = new firefox.Options()
    options.setBinary('/usr/bin/firefox-esr')
    options.addArguments('--headless')
    options.addArguments('--no-sandbox')
    options.addArguments('--disable-dev-shm-usage')
    options.setAcceptInsecureCerts(true)

    driver = await new Builder()
      .forBrowser('firefox')
      .setFirefoxOptions(options)
      .build()
  })

  afterEach(async function() {
    if (driver) await driver.quit();
  })

  it('deberia mostrar todos los enlaces disponibles después del login', async function() {
    await driver.get("https://10.6.131.134/login")
    await driver.manage().window().setRect({ width: 1070, height: 1063 })
    
    // Login
    await driver.findElement(By.css(".w-full:nth-child(1)")).sendKeys("nano@ull.es")
    await driver.findElement(By.css(".w-full:nth-child(2)")).sendKeys("123456")
    await driver.findElement(By.css("button[type='submit']")).click()
    
    // Esperar a que cargue
    await driver.sleep(5000)
    
    // Capturar todos los enlaces visibles
    const links = await driver.findElements(By.css("a"))
    console.log("=== ENLACES DISPONIBLES ===")
    for (let link of links) {
      try {
        const text = await link.getText()
        if (text && text.trim()) {
          console.log(`- "${text.trim()}"`)
        }
      } catch (e) {
        // Ignorar errores
      }
    }
    
    // Capturar todos los botones visibles
    const buttons = await driver.findElements(By.css("button"))
    console.log("=== BOTONES DISPONIBLES ===")
    for (let button of buttons) {
      try {
        const text = await button.getText()
        if (text && text.trim()) {
          console.log(`- "${text.trim()}"`)
        }
      } catch (e) {
        // Ignorar errores
      }
    }
  })
})