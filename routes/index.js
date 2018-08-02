let express = require('express');
let mongoose = require('../settings/databaseSettings');
let winston = require('../settings/winstonSettings');
let redis = require('../settings/redisSettings');
let router = express.Router();

let pricingData = new mongoose.Schema({
    couponName: { type: String },
    pricingData: { type: Object, required: true, unique: true },
    createdAt: { type: Date, required: true }
},{
    versionKey: false
});

let coupon = new mongoose.Schema({
    name: String
},{
    versionKey: false
});

const PricingData = mongoose.model('PricingData', pricingData);
const Coupon = mongoose.model('Coupon', coupon);

let basicCoupon = new PricingData({
    couponName: 'basicCoupon',
    pricingData: {
        amount: '9$',
        daysForActivation: '5'
    },
    createdAt: '2018-08-01T00:00:00.000Z'
});


let appleStoreCoupon = new PricingData({
    couponName: 'appleStoreCoupon',
    pricingData: {
        amount: '999$',
        daysForActivation: '365'
    },
    createdAt: '2017-09-12T21:30:00.000Z'
});

let groceryShopCoupon = new PricingData({
    couponName: 'groceryShopCoupon',
    pricingData: {
        amount: '299$',
        daysForActivation: '30'
    },
    createdAt: '2018-07-21T12:30:00.000Z'
});

let shoppingMallCoupon = new PricingData({
    couponName: 'shoppingMallCoupon',
    pricingData: {
        amount: '599$',
        daysForActivation: '120'
    },
    createdAt: '2018-07-31T16:15:00.000Z'
});


function removeIdFromJSON(key,value) {
    if (key === "_id") return undefined;
    else return value;
}


router.get('/addCoupons',function (req,res) {
    basicCoupon.save();
    appleStoreCoupon.save();
    groceryShopCoupon.save();
    shoppingMallCoupon.save();
    new Coupon({name: basicCoupon.couponName}).save();
    new Coupon({name: appleStoreCoupon.couponName}).save();
    new Coupon({name: groceryShopCoupon.couponName}).save();
    new Coupon({name: shoppingMallCoupon.couponName}).save();
    let infoCoupons = 'Coupons was added to the database!'
    winston.info(infoCoupons);
    res.send(infoCoupons);
});


router.get('/pricing/:coupon?', function(req, res) {
    let start_time = new Date().getTime();
    let key = req.query.coupon;
    if(key === undefined){
        key = 'basicCoupon';
    }
    redis.get(key, function (err, data) {
        if (err) {
            winston.error(err);
            throw err;
        }
        if (data !== null) {
            let end_time = new Date().getTime() - start_time;
            winston.info("Endpoint time execution: " + end_time + "ms");
            res.send(data);
        } else {
            PricingData.find({couponName: key},function (err, data) {
                redis.setex(key,300, JSON.stringify(data,removeIdFromJSON));
                let end_time = new Date().getTime() - start_time;
                winston.info("Endpoint time execution: " + end_time + "ms");
                res.send(JSON.stringify(data, removeIdFromJSON));
            });
        }
    });
});


module.exports = router;
