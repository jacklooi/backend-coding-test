'use strict';

const request = require('supertest');
const expect = require('chai').expect;
const sinon = require('sinon');

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

const app = require('../src/app')(db);
const buildSchemas = require('../src/schemas');

describe('API tests', () => {
    before((done) => {
        db.serialize((err) => { 
            if (err) {
                return done(err);
            }

            buildSchemas(db);

            done();
        });
    });

    describe('GET /health', () => {
        it('should return health', (done) => {
            request(app)
                .get('/health')
                .expect('Content-Type', /text/)
                .expect(200, done);
        });
    });

    describe('POST /rides', () => {
        beforeEach(() => {
            sinon.restore();
        });

        const body = {
            start_lat: 0,
            start_long: 0,
            end_lat: 0,
            end_long: 0,
            rider_name: 'Rider Name',
            driver_name: 'Driver Name',
            driver_vehicle: 'Driver Vehicle',
        };

        it('should return health', (done) => {
            request(app)
                .post('/rides')
                .send(body)
                .expect('Content-Type', /json/)
                .expect(200, done);
        });

        it('should return error_code with "Start latitude and longitude" error message', (done) => {
            const newBody = { ...body, start_lat: -100 };
            request(app)
                .post('/rides')
                .send(newBody)
                .expect('Content-Type', /json/)
                .expect(200)
                .then(response => {
                    expect(response.body.error_code).equal('VALIDATION_ERROR');
                    expect(response.body.message).contain('Start latitude and longitude');
                    done();
                });
        });

        it('should return error_code with "End latitude and longitude" error message', (done) => {
            const newBody = { ...body, end_lat: -100 };
            request(app)
                .post('/rides')
                .send(newBody)
                .expect('Content-Type', /json/)
                .expect(200)
                .then(response => {
                    expect(response.body.error_code).equal('VALIDATION_ERROR');
                    expect(response.body.message).contain('End latitude and longitude');
                    done();
                });
        });

        it('should return error_code with "Rider name" error message', (done) => {
            const newBody = { ...body, rider_name: '' };
            request(app)
                .post('/rides')
                .send(newBody)
                .expect('Content-Type', /json/)
                .expect(200)
                .then(response => {
                    expect(response.body.error_code).equal('VALIDATION_ERROR');
                    expect(response.body.message).contain('Rider name');
                    done();
                });
        });

        it('should return error_code with "Rider name" error message', (done) => {
            const newBody = { ...body, driver_name: '' };
            request(app)
                .post('/rides')
                .send(newBody)
                .expect('Content-Type', /json/)
                .expect(200)
                .then(response => {
                    expect(response.body.error_code).equal('VALIDATION_ERROR');
                    expect(response.body.message).contain('Rider name');
                    done();
                });
        });

        it('should return error_code with "Rider name" error message', (done) => {
            const newBody = { ...body, driver_vehicle: '' };
            request(app)
                .post('/rides')
                .send(newBody)
                .expect('Content-Type', /json/)
                .expect(200)
                .then(response => {
                    expect(response.body.error_code).equal('VALIDATION_ERROR');
                    expect(response.body.message).contain('Rider name');
                    done();
                });
        });

        it('should return error_code with server error before insert record', (done) => {
            sinon.stub(db, 'run').throws({ err: 'db error' });
            request(app)
                .post('/rides')
                .send(body)
                .expect('Content-Type', /json/)
                .expect(200)
                .then(response => {
                    expect(response.body.error_code).equal('SERVER_ERROR');
                    expect(response.body.message).contain('Unknown error');
                    done();
                });
        });

        it('should return error_code with server error after insert record', (done) => {
            sinon.stub(db, 'all').throws({ err: 'db error' });
            request(app)
                .post('/rides')
                .send(body)
                .expect('Content-Type', /json/)
                .expect(200)
                .then(response => {
                    expect(response.body.error_code).equal('SERVER_ERROR');
                    expect(response.body.message).contain('Unknown error');
                    done();
                });
        });
    });

    describe('GET /rides', () => {
        beforeEach(() => {
            sinon.restore();
        });

        it('should return health', (done) => {
            request(app)
                .get('/rides')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });

        it('should return error_code with server error', (done) => {
            sinon.stub(db, 'all').throws({ err: 'db error' });
            request(app)
                .get('/rides')
                .expect('Content-Type', /json/)
                .expect(200)
                .then(response => {
                    expect(response.body.error_code).equal('SERVER_ERROR');
                    expect(response.body.message).contain('Unknown error');
                    done();
                });
        });

        it('should return error_code with no rides found', (done) => {
            sinon.stub(db, 'all').returns([]);
            request(app)
                .get('/rides')
                .expect('Content-Type', /json/)
                .expect(200)
                .then(response => {
                    expect(response.body.error_code).equal('RIDES_NOT_FOUND_ERROR');
                    expect(response.body.message).contain('Could not find any rides');
                    done();
                });
        });
    });

    describe('GET /rides/:id', () => {
        beforeEach(() => {
            sinon.restore();
        });

        const rideId = 1;

        it('should return health', (done) => {
            request(app)
                .get(`/rides/${rideId}`)
                .expect('Content-Type', /json/)
                .expect(200, done);
        });

        it('should return error_code with server error', (done) => {
            sinon.stub(db, 'all').throws({ err: 'db error' });
            request(app)
                .get(`/rides/${rideId}`)
                .expect('Content-Type', /json/)
                .expect(200)
                .then(response => {
                    expect(response.body.error_code).equal('SERVER_ERROR');
                    expect(response.body.message).contain('Unknown error');
                    done();
                });
        });

        it('should return error_code with no rides found', (done) => {
            sinon.stub(db, 'all').returns([]);
            request(app)
                .get(`/rides/${rideId}`)
                .expect('Content-Type', /json/)
                .expect(200)
                .then(response => {
                    expect(response.body.error_code).equal('RIDES_NOT_FOUND_ERROR');
                    expect(response.body.message).contain('Could not find any rides');
                    done();
                });
        });
    });
});