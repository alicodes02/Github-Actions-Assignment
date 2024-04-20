const { expect } = require('chai');
const { echoSomething } = require('../utils/helpers'); // Assuming your echo function is defined in a separate file

describe('echoSomething function', () => {
  it('should echo "Hello, world!" to the console', () => {
    // Capture console.log output
    let consoleOutput = '';
    const mockedConsoleLog = (output) => {
      consoleOutput += output;
    };
    console.log = mockedConsoleLog;

    // Call the echo function
    echoSomething();

    // Restore console.log
    console.log = console._log;

    // Assert the output
    expect(consoleOutput).to.equal('Hello, world!');
  });
});
