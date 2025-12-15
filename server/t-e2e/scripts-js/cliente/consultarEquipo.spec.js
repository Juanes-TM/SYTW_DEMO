const { Builder, By, Key, until } = require('selenium-webdriver')
const assert = require('assert')
const firefox = require('selenium-webdriver/firefox')

describe('ConsultarEquipo', function() {
  jest.setTimeout(30000)
  let driver
  let vars
  beforeEach(async function() {
    const options = new firefox.Options()
    options.setBinary('/usr/bin/firefox-esr')
    options.addArguments('--headless')
    options.addArguments('--no-sandbox')
    options.addArguments('--disable-dev-shm-usage')
    options.setAcceptInsecureCerts(true)
    driver = await new Builder().forBrowser('firefox').setFirefoxOptions(options).build()
    vars = {}
  })
  afterEach(async function() {
    if (driver) await driver.quit();
  })
  it('ConsultarEquipo', async function() {
    await driver.get("https://10.6.131.134/")
    await driver.manage().window().setRect({ width: 1226, height: 1063 })
    await driver.findElement(By.css(".w-full:nth-child(1)")).click()
    await driver.findElement(By.css(".w-full:nth-child(1)")).sendKeys("nano@ull.es")
    await driver.findElement(By.css(".w-full:nth-child(2)")).click()
    await driver.findElement(By.css(".w-full:nth-child(2)")).sendKeys("123456")
    await driver.findElement(By.css(".bg-teal-600")).click()
    await driver.findElement(By.css(".hover\\3A bg-teal-500 > span")).click()
    await driver.findElement(By.css(".bg-white:nth-child(1) > .bg-teal-600")).click()
    await driver.findElement(By.css(".w-full:nth-child(7)")).click()
    await driver.findElement(By.css(".bg-white:nth-child(6) > .bg-teal-600")).click()
    await driver.findElement(By.css(".w-full:nth-child(7)")).click()
  })
})