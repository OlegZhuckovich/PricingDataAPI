const chai = require('chai');
const expect = chai.expect;
const mongoose = require('mongoose');
let redis = require('../settings/redisSettings');
let request = require('request');
let winston = require('../settings/winstonSettings');

let pricingSchema = new mongoose.Schema({
    couponName: { type: String },
    pricingData: { type: Object, required: true, unique: true },
    createdAt: { type: Date, required: true }
},{
    versionKey: false
});

const Coupon = mongoose.model('TestCoupon', pricingSchema);

let basicCoupon = new Coupon({
    couponName: 'basicCoupon',
    pricingData: {
        amount: '9$',
        daysForActivation: '5'
    },
    createdAt: '2018-08-01T00:00:00.000Z'
});

let appleStoreCoupon = new Coupon({
    couponName: 'appleStoreCoupon',
    pricingData: {
        amount: '999$',
        daysForActivation: '365'
    },
    createdAt: '2017-09-12T21:30:00.000Z'
});

let groceryShopCoupon = new Coupon({
    couponName: 'groceryShopCoupon',
    pricingData: {
        amount: '299$',
        daysForActivation: '30'
    },
    createdAt: '2018-07-21T12:30:00.000Z'
});

let shoppingMallCoupon = new Coupon({
    couponName: 'shoppingMallCoupon',
    pricingData: {
        amount: '599$',
        daysForActivation: '120'
    },
    createdAt: '2018-07-31T16:15:00.000Z'

});


describe('PricingDataAPITests', function() {
    before(function (done) {
        mongoose.connect('mongodb://localhost/PricingDataAPITest');
        const databaseConnection = mongoose.connection;
        databaseConnection.on('error', function () {
            winston.error('Connection error');
        });
        databaseConnection.once('open', function () {
            winston.info('Connected to the test database successfully');
            done();
        });
    });

    describe('Database tests', function () {
        it("New coupon saved to the test database", function (done) {
            basicCoupon.save();
            appleStoreCoupon.save();
            groceryShopCoupon.save();
            shoppingMallCoupon.save();
            done();
        });
        it("Don't save object in incorrect format to database", function (done) {
            let incorrectTestCoupon = Coupon({
                couponName: 'incorrectTestCoupon',
                pricingData: {
                    price: '499$'
                }
            });
            incorrectTestCoupon.save(function (err) {
                if (err) {
                    return done();
                }
                throw new Error('Test generating error');
            });
        });
        it("Should retrieve coupon data from the test database", function (done) {
            Coupon.find({couponName: 'appleStoreCoupon'}, (err, couponName) => {
                if (err) {
                    throw err;
                }
                else if (couponName.length === 0) {
                    throw new Error("CouponName doesn't! contain symbols");
                }
                done();
            });
        });
    });


    describe('Request tests', function () {
        it("Gets info about coupons with name 'groceryShopCoupon'", function (done) {
            request('http://localhost:3000/pricing?coupon=groceryShopCoupon', (error, response, body) => {
                 let key = 0;
                 body = JSON.parse(body);
                 expect('groceryShopCoupon').to.equal(body[key].couponName);
                 expect('299$').to.equal(body[key].pricingData.amount);
                 expect('30').to.equal(body[key].pricingData.daysForActivation);
                 done();
            });
        });
        it("Gets special coupon when coupon parameter is not defined", function (done) {
            request('http://localhost:3000/pricing', (error, response, body) => {
                 let key = 0;
                 body = JSON.parse(body);
                 expect('basicCoupon').to.equal(body[key].couponName);
                 expect('9$').to.equal(body[key].pricingData.amount);
                 expect('5').to.equal(body[key].pricingData.daysForActivation);
                done();
            });
        });
    });


    describe('Redis cache tests', function () {
        var key = 'basicCoupon';
        before(function () {
            Coupon.find({couponName: key}, function (err, data) {
                redis.setex(key, 10, data.toString());
            });
        });

        it("Test that retrieve information from redis", function (done) {
            redis.get(key, function (err, data) {
                if (data !== null) {
                    return done();
                }
            });
        });
    });

   after(function (done) {
       mongoose.connection.db.dropDatabase(function () {
           mongoose.connection.close(done);
       });
   });

});
