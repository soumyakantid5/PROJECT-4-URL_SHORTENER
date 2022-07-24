const validUrl = require("valid-url");
const { promisify } = require("util");
const {redisClient}=require('../cache_config')
//const shortid = require("shortid");
const urlModel = require("../models/urlModel");


const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

//---------------------------Valiadtions-----------------------------------------//

//request body validation
const isValidRequest = (el) => Object.keys(el).length > 0;
//value validation
const isValidValue = function (value) {
  if (typeof value === "undefined" || value === null) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  if (typeof value === "number") return false;
  return true;
};

//---------------------------------------------------Shorten Url API---------------------------------------------------//
const shortenUrl = async (req, res) => {
  try {
    let longUrl = req.body.longUrl;
    //input validation
    if (!isValidRequest(req.body))
      return res
        .status(400)
        .send({ status: false, message: "No input by user" });

    if (!isValidValue(longUrl))
      return res
        .status(400)
        .send({ status: false, message: "longUrl is required." });

    //validation for Long Url
    if (!validUrl.isWebUri(longUrl))
      return res
        .status(400)
        .send({ status: false, message: "Long Url is invalid." });

   
    //  check for data in the cache
    let cachedlinkdata = await GET_ASYNC(`${req.body.longUrl}`);

    if (cachedlinkdata) {
      let change = JSON.parse(cachedlinkdata);
      return res.status(200).send({
        status: true,
        message: "data found in Cache Memory ",
        redisdata: change,
      });
    }

    // check for data in the Database
    const alreadyExistUrl = await urlModel
      .findOne({ $or: [{longUrl: longUrl},{shortUrl: longUrl} ] })
      .select({ createdAt: 0, updatedAt: 0, __v: 0, _id: 0 });

    if (alreadyExistUrl) {
      //setting data in cache
      await SET_ASYNC(
        `${req.body.longUrl}`,
        JSON.stringify(alreadyExistUrl),
        "EX",
        60 * 60 * 24
      );

      return res.status(200).send({
        status: true,
        message: "Shorten link already generated previously",
        data: alreadyExistUrl,
      });
    } else {

      let baseUrl = `${req.protocol}://${req.headers.host}/`;

      //let urlCode = shortid.generate().toLowerCase();
      let urlCode = Math.trunc((Math.random() * 1e16)).toString(36);

      let shortUrl = baseUrl+urlCode;

      const generateUrl = { urlCode, longUrl, shortUrl };

      let createUrl = await urlModel.create(generateUrl);

      return res
        .status(201)
        .send({
          status: true,
          message: "Short url Successfully created",
          data: generateUrl,
        });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({ status: false, message: err });
  }
};

//---------------------------------------------------Get Url API------------------------------------------------------//

const getUrl = async (req, res) => {
  try {
    const urlCode = req.params.urlCode;

    let urlcache = await GET_ASYNC(`${urlCode}`);

    if (urlcache) {
      return res.redirect(302,JSON.parse(urlcache));
    } else {
      
      const UrlDb = await urlModel.findOne({ urlCode: urlCode });
      if (UrlDb) {
        await SET_ASYNC(`${urlCode}`, JSON.stringify(UrlDb.longUrl));
        return res.redirect(302,UrlDb.longUrl);
      } else {
        return res.status(404).send({ status: false, message: "No URL Found" });
      }
    }
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

module.exports = { shortenUrl, getUrl };
