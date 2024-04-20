const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app'); // assuming your Express app is defined in app.js
const expect = chai.expect;

chai.use(chaiHttp);

describe('GET /test', () => {
  it('should return status 200 and message "Api is live and running"', (done) => {
    chai.request(app)
      .get('/test')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.text).to.equal("Api is live and running");
        done();
      });
  });
});
