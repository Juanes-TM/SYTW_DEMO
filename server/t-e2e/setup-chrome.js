const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

function createChromeDriver() {
  const options = new chrome.Options();
  
  options.addArguments(
    '--headless=new',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--window-size=1920,1080',
    '--disable-extensions'
  );

  const driver = new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();
    
  // Configurar timeouts globales
  driver.manage().setTimeouts({ 
    implicit: 10000, 
    pageLoad: 30000,
    script: 30000 
  });
  
  return driver;
}

// Función helper para login
async function login(driver, email, password) {
  console.log(`Attempting login for: ${email}`);
  
  await driver.get("http://localhost:3000/");
  
  // Esperar y llenar formulario
  await driver.wait(until.elementLocated(By.css('input[type="email"], input[type="text"]')), 15000);
  const emailInput = await driver.findElement(By.css('input[type="email"], input[type="text"]'));
  await emailInput.clear();
  await emailInput.sendKeys(email);
  
  const passwordInput = await driver.findElement(By.css('input[type="password"]'));
  await passwordInput.clear();
  await passwordInput.sendKeys(password);
  
  // Hacer click en el botón de login
  const loginButton = await driver.findElement(By.css('button[type="submit"], .bg-teal-600, button:contains("Login")'));
  await loginButton.click();
  
  // Esperar a que ocurra alguna redirección o cambio
  console.log('Waiting for login to complete...');
  
  // Intentar diferentes estrategias de espera
  try {
    // Estrategia 1: Esperar cambio de URL
    await driver.wait(async () => {
      const currentUrl = await driver.getCurrentUrl();
      return currentUrl.includes('/dashboard') || 
             currentUrl.includes('/calendar') ||
             currentUrl !== 'http://localhost:3000/';
    }, 20000);
    
    const finalUrl = await driver.getCurrentUrl();
    console.log(`Login successful. Final URL: ${finalUrl}`);
    return true;
    
  } catch (error) {
    console.log('Login timeout, checking current state...');
    
    // Verificar si hay elementos de dashboard
    try {
      const dashboardElements = await driver.findElements(By.css('[class*="dashboard"], [class*="Dashboard"], .sidebar, nav'));
      if (dashboardElements.length > 0) {
        console.log('Found dashboard elements - login probably succeeded');
        return true;
      }
    } catch (e) {
      console.log('No dashboard elements found');
    }
    
    return false;
  }
}

module.exports = { createChromeDriver, By, Key, until, login };
