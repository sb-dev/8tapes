const miniget = require('miniget');
const querystring = require('querystring');
const urllib = require('url');
const Cache = require('./cache');
const extras = require('./info-extras');
const sig = require('./sig');
const utils = require('./utils');
const formatUtils = require('./format-utils');

const VIDEO_URL = 'https://www.youtube.com/watch?v=';

// Cached for storing basic/full info.
const cache = new Cache();
const cookieCache = new Cache(1000 * 60 * 60 * 24);
const watchPageCache = new Cache();

// Special error class used to determine if an error is unrecoverable,
// as in, ytdl-core should not try again to fetch the video metadata.
// In this case, the video is usually unavailable in some way.
class UnrecoverableError extends Error {}

/**
 * Like Object.assign(), but ignores `null` and `undefined` from `source`.
 *
 * @param {Object} target
 * @param {Object} source
 * @returns {Object}
 */
const assign = (target, source) => {
  if (!target || !source) { return target || source; }
  for (let [key, value] of Object.entries(source)) {
    if (value !== null && value !== undefined) {
      target[key] = value;
    }
  }
  return target;
};

/**
 * Given a function, calls it with `args` until it's successful,
 * or until it encounters an unrecoverable error.
 * Currently, any error from miniget is considered unrecoverable. Errors such as
 * too many redirects, invalid URL, status code 404, status code 502.
 *
 * @param {Function} func
 * @param {Array.<Object>} args
 * @param {Object} options
 * @param {number} options.maxRetries
 * @param {Object} options.backoff
 * @param {number} options.backoff.inc
 */
const retryFunc = async(func, args, options) => {
  let currentTry = 0, result;
  while (currentTry <= options.maxRetries) {
    try {
      result = await func(...args);
      break;
    } catch (err) {
      if (err instanceof UnrecoverableError ||
        (err instanceof miniget.MinigetError && err.statusCode < 500) || currentTry >= options.maxRetries) {
        throw err;
      }
      let wait = Math.min(++currentTry * options.backoff.inc, options.backoff.max);
      await new Promise(resolve => setTimeout(resolve, wait));
    }
  }
  return result;
};

/**
 * Goes through each endpoint in the pipeline, retrying on failure if the error is recoverable.
 * If unable to succeed with one endpoint, moves onto the next one.
 *
 * @param {Array.<Object>} args
 * @param {Function} validate
 * @param {Object} retryOptions
 * @param {Array.<Function>} endpoints
 * @returns {[Object, Object, Object]}
 */
const pipeline = async (args, validate, retryOptions, endpoints) => {
  let info;
  for (let func of endpoints) {
    try {
      const newInfo = await retryFunc(func, args.concat([info]), retryOptions);
      if (newInfo.player_response) {
        newInfo.player_response.videoDetails = assign(
          info && info.player_response && info.player_response.videoDetails,
          newInfo.player_response.videoDetails
        );
        newInfo.player_response = assign(
          info && info.player_response,
          newInfo.player_response
        );
      }
      info = assign(info, newInfo);
      if (validate(info, false)) {
        break;
      }
    } catch (err) {
      if (
        err instanceof UnrecoverableError ||
        func === endpoints[endpoints.length - 1]
      ) {
        throw err;
      }
      // Unable to find video metadata... so try next endpoint.
    }
  }
  return info;
};

const getHTML5player = body => {
  let html5playerRes =
    /<script\s+src="([^"]+)"(?:\s+type="text\/javascript")?\s+name="player_ias\/base"\s*>|"jsUrl":"([^"]+)"/
      .exec(body);
  return html5playerRes ? html5playerRes[1] || html5playerRes[2] : null;
};

const getWatchHTMLURL = (id, options) => `${VIDEO_URL + id}&hl=${options.lang || 'en'}`;
const getWatchHTMLPageBody = (id, options) => {
  const url = getWatchHTMLURL(id, options);
  return watchPageCache.getOrSet(url, () => miniget(url, options.requestOptions).text());
};

const jsonClosingChars = /^[)\]}'\s]+/;
const parseJSON = (source, varName, json) => {
  if (!json || typeof json === 'object') {
    return json;
  } else {
    try {
      json = json.replace(jsonClosingChars, '');
      return JSON.parse(json);
    } catch (err) {
      throw Error(`Error parsing ${varName} in ${source}: ${err.message}`);
    }
  }
};

const findJSON = (source, varName, body, left, right, prependJSON = "") => {
  let jsonStr = utils.between(body, left, right);
  if (!jsonStr) {
    throw Error(`Could not find ${varName} in ${source}`);
  }
  return parseJSON(
    source,
    varName,
    utils.cutAfterJSON(`${prependJSON}${jsonStr}`)
  );
};

const findPlayerResponse = (source, info) => {
  const player_response = info && (
    (info.args && info.args.player_response) ||
    info.player_response || info.playerResponse || info.embedded_player_response);
  return parseJSON(source, 'player_response', player_response);
};

const getWatchHTMLPage = async(id, options) => {
    let body = await getWatchHTMLPageBody(id, options);
    let info = { page: 'watch' };
    
    try {
        info.player_response = findJSON('watch.html', 'player_response',
        body, /\bytInitialPlayerResponse\s*=\s*\{/i, '\n', '{');
    } catch (err) {
        let args = findJSON('watch.html', 'player_response', body, /\bytplayer\.config\s*=\s*{/, '</script>', '{');
        info.player_response = findPlayerResponse('watch.html', args);
    }
    
    info.response = findJSON('watch.html', 'response', body, /\bytInitialData("\])?\s*=\s*\{/i, '\n', '{');
    info.html5player = getHTML5player(body);
    return info;
};

const getWatchJSONURL = (id, options) => `${getWatchHTMLURL(id, options)}&pbj=1`;
const getWatchJSONPage = async(id, options) => {
  const reqOptions = Object.assign({ headers: {} }, options.requestOptions);
  let cookie = reqOptions.headers.Cookie || reqOptions.headers.cookie;
  reqOptions.headers = Object.assign({
    'x-youtube-client-name': '1',
    'x-youtube-client-version': '2.20201203.06.00',
    'x-youtube-identity-token': exports.cookieCache.get(cookie || 'browser') || '',
  }, reqOptions.headers);

  const setIdentityToken = async(key, throwIfNotFound) => {
    if (reqOptions.headers['x-youtube-identity-token']) { return; }
    reqOptions.headers['x-youtube-identity-token'] = await getIdentityToken(id, options, key, throwIfNotFound);
  };

  if (cookie) {
    await setIdentityToken(cookie, true);
  }

  const jsonUrl = getWatchJSONURL(id, options);
  let body = await miniget(jsonUrl, reqOptions).text();
  let parsedBody = parseJSON('watch.json', 'body', body);
  if (parsedBody.reload === 'now') {
    await setIdentityToken('browser', false);
  }
  if (parsedBody.reload === 'now' || !Array.isArray(parsedBody)) {
    throw Error('Unable to retrieve video metadata in watch.json');
  }
  let info = parsedBody.reduce((part, curr) => Object.assign(curr, part), {});
  info.player_response = findPlayerResponse('watch.json', info);
  info.html5player = info.player && info.player.assets && info.player.assets.js;

  return info;
};

const INFO_HOST = 'www.youtube.com';
const INFO_PATH = '/get_video_info';
const VIDEO_EURL = 'https://youtube.googleapis.com/v/';
const getVideoInfoPage = async(id, options) => {
  const url = urllib.format({
    protocol: 'https',
    host: INFO_HOST,
    pathname: INFO_PATH,
    query: {
      video_id: id,
      eurl: VIDEO_EURL + id,
      ps: 'default',
      gl: 'US',
      hl: options.lang || 'en',
    },
  });
  let body = await miniget(url, options.requestOptions).text();
  let info = querystring.parse(body);
  info.player_response = findPlayerResponse('get_video_info', info);
  return info;
};

const privateVideoError = player_response => {
  let playability = player_response && player_response.playabilityStatus;
  if (playability && playability.status === 'LOGIN_REQUIRED' && playability.messages &&
    playability.messages.filter(m => /This is a private video/.test(m)).length) {
    return new UnrecoverableError(playability.reason || (playability.messages && playability.messages[0]));
  } else {
    return null;
  }
};

const getBasicInfo = async (id, options) => {
  const retryOptions = Object.assign(
    {},
    miniget.defaultOptions,
    options.requestOptions
  );
  
  const validate = (info) => {
    let playErr = utils.playError(
      info.player_response,
      ["ERROR"],
      UnrecoverableError
    );
    let privateErr = privateVideoError(info.player_response);
    if (playErr || privateErr) {
      throw playErr || privateErr;
    }
    return (
      info &&
      info.player_response &&
      (info.player_response.streamingData ||
        isRental(info.player_response) ||
        isNotYetBroadcasted(info.player_response))
    );
  };
  
  let info = await pipeline([id, options], validate, retryOptions, [
    getWatchHTMLPage,
    getWatchJSONPage,
    getVideoInfoPage,
  ]);

  Object.assign(info, {
    formats: parseFormats(info.player_response),
    related_videos: extras.getRelatedVideos(info),
  });

  // Add additional properties to info.
  const media = extras.getMedia(info);
  let additional = {
    author: extras.getAuthor(info),
    media,
    likes: extras.getLikes(info),
    dislikes: extras.getDislikes(info),
    age_restricted: !!(
      media &&
      media.notice_url &&
      AGE_RESTRICTED_URLS.some((url) => media.notice_url.includes(url))
    ),

    // Give the standard link to the video.
    video_url: VIDEO_URL + id,
  };

  info.videoDetails = extras.cleanVideoDetails(
    Object.assign(
      {},
      info.player_response &&
        info.player_response.microformat &&
        info.player_response.microformat.playerMicroformatRenderer,
      info.player_response && info.player_response.videoDetails,
      additional
    )
  );

  return info;
};

/**
 * @param {Object} player_response
 * @returns {Array.<Object>}
 */
const parseFormats = player_response => {
  let formats = [];
  if (player_response && player_response.streamingData) {
    formats = formats
      .concat(player_response.streamingData.formats || [])
      .concat(player_response.streamingData.adaptiveFormats || []);
  }
  return formats;
};


const getInfo = async (id, options) => {
  let info = await getBasicInfo(id, options);

  const hasManifest =
    info.player_response &&
    info.player_response.streamingData &&
    (info.player_response.streamingData.dashManifestUrl ||
      info.player_response.streamingData.hlsManifestUrl);

  let funcs = [];
  if (info.formats.length) {
    info.html5player =
      info.html5player ||
      getHTML5player(await getWatchHTMLPageBody(id, options)) ||
      getHTML5player(await getEmbedPageBody(id, options));
    if (!info.html5player) {
      throw Error("Unable to find html5player file");
    }
    const html5player = urllib.resolve(VIDEO_URL, info.html5player);
    funcs.push(sig.decipherFormats(info.formats, html5player, options));
  }

  if (hasManifest && info.player_response.streamingData.dashManifestUrl) {
    let url = info.player_response.streamingData.dashManifestUrl;
    funcs.push(getDashManifest(url, options));
  }

  if (hasManifest && info.player_response.streamingData.hlsManifestUrl) {
    let url = info.player_response.streamingData.hlsManifestUrl;
    funcs.push(getM3U8(url, options));
  }

  let results = await Promise.all(funcs);
  info.formats = Object.values(Object.assign({}, ...results));
  info.formats = info.formats.map(formatUtils.addFormatMeta);
  info.formats.sort(formatUtils.sortFormats);
  info.full = true;
  return info;
};

(async () => {
    const info = await getInfo('ewoonPUDY3I', []);
    console.log(JSON.stringify(info));
})();