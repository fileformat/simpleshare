
# SimpleShare [<img alt="SimpleShare Logo" src="https://www.vectorlogo.zone/logos/simplesharedev/simplesharedev-tile.svg" height="96" align="right" />](https://simpleshare.dev/)
[![# of sites](https://img.shields.io/badge/dynamic/json.svg?style=flat-square&label=Social+sites&url=https%3A%2F%2Fsimpleshare.dev%2Fstatus.json&query=%24.targetcount)](https://simpleshare.dev/)
[![deploy](https://github.com/fileformat/simpleshare/actions/workflows/gcr-deploy.yaml/badge.svg)](https://github.com/fileformat/simpleshare/actions/workflows/gcr-deploy.yaml)
[![AGPLv3](https://img.shields.io/github/license/fileformat/simpleshare.svg?style=flat-square)](LICENSE.txt)

[SimpleShare](https://simpleshare.dev/) is a simple site to redirect to one of the social sharing sites.  It is really just so I don't have to use a third-party service that bloats my pages with a ton of Javascript and tracks my viewers.

And I only have one place where I manage all the URLs for sharing on each social site.

There are more details on the [SimpleShare home page](https://simpleshare.dev/) page.

## Demo

Hey, script-less means in works in README files, so go ahead and share a link to [SimpleShare.dev](https://simpleshare.dev/)!!!

Share:
<a href="https://simpleshare.dev/go?site=facebook&amp;url=https%3A%2F%2Fsimpleshare.dev%2F&amp;text=Simple+script-less+share+buttons&amp;ga=UA-328425-45" rel="nofollow"><img alt="share on facebook" src="https://www.vectorlogo.zone/logos/facebook/facebook-tile.svg" height="24" /></a>
<a href="https://simpleshare.dev/go?site=hn&amp;url=https%3A%2F%2Fsimpleshare.dev%2F&amp;text=Simple+script-less+share+buttons&amp;ga=UA-328425-45" rel="nofollow"><img alt="share on hacker news" src="https://www.vectorlogo.zone/logos/ycombinator/ycombinator-tile.svg" height="24" /></a>
<a href="https://simpleshare.dev/go?site=pinboard&amp;url=https%3A%2F%2Fsimpleshare.dev%2F&amp;text=Simple+script-less+share+buttons&amp;ga=UA-328425-45" rel="nofollow"><img alt="share on pinboard" src="https://www.vectorlogo.zone/logos/pinboard/pinboard-tile.svg" height="24" v/></a>
<a href="https://simpleshare.dev/go?site=reddit&amp;url=https%3A%2F%2Fsimpleshare.dev%2F&amp;text=Simple+script-less+share+buttons&amp;ga=UA-328425-45" rel="nofollow"><img alt="share on reddit" src="https://www.vectorlogo.zone/logos/reddit/reddit-tile.svg" height="24" /></a>
<a href="https://simpleshare.dev/go?site=twitter&amp;url=https%3A%2F%2Fsimpleshare.dev%2F&amp;text=Simple+script-less+share+buttons&amp;ga=UA-328425-45" rel="nofollow"><img alt="share on twitter" src="https://www.vectorlogo.zone/logos/twitter/twitter-tile.svg" height="24" /></a>

## Using

Follow the instructions in the [Home Page](https://simpleshare.dev/).

## Running your own copy

It is a simple node.js app:

```bash
npm install
npm run start
```

If you want to send an event to Google Analytics for every hit, set the `GA_ID` environment variable to your GA property ID.

Set the `PORT` environment variable to run it on a specific port.

## Contributing

Contributions are welcome!  Please see the [Contribution Guidelines](CONTRIBUTING.md)!

## License

[GNU Affero General Public License v3.0](LICENSE.txt)

## Credits

[![Cloudflare](https://www.vectorlogo.zone/logos/cloudflare/cloudflare-ar21.svg)](https://www.cloudflare.com/ "Domain and DNS")
[![Git](https://www.vectorlogo.zone/logos/git-scm/git-scm-ar21.svg)](https://git-scm.com/ "Version control")
[![Github](https://www.vectorlogo.zone/logos/github/github-ar21.svg)](https://github.com/ "Code hosting")
[![GoatCounter](https://www.vectorlogo.zone/logos/goatcounter/goatcounter-ar21.svg)](https://www.goatcounter.com/ "Traffic Measurement")
[![Google CloudRun](https://www.vectorlogo.zone/logos/google_cloud_run/google_cloud_run-ar21.svg)](https://cloud.google.com/run/ "Hosting")
[![Koa](https://www.vectorlogo.zone/logos/koajs/koajs-ar21.svg)](https://koajs.com/ "Web framework")
[![Node.js](https://www.vectorlogo.zone/logos/nodejs/nodejs-ar21.svg)](https://nodejs.org/ "Application Server")
[![Nodemon](https://www.vectorlogo.zone/logos/nodemonio/nodemonio-ar21.svg)](https://nodemon.io/ "Development tool")
[![NodePing](https://www.vectorlogo.zone/logos/nodeping/nodeping-ar21.svg)](https://nodeping.com?rid=201109281250J5K3P "Uptime monitoring")
[![npm](https://www.vectorlogo.zone/logos/npmjs/npmjs-ar21.svg)](https://www.npmjs.com/ "JS Package Management")[![Pico CSS](https://www.vectorlogo.zone/logos/picocss/picocss-ar21.svg)](https://picocss.com/ "CSS")
[![pino](https://www.vectorlogo.zone/logos/getpinoio/getpinoio-ar21.svg)](https://www.getpino.io/ "Logging")
[![SuperTinyIcons](https://www.vectorlogo.zone/logos/supertinyicons/supertinyicons-ar21.svg)](https://supertinyicons.org/ "Images")
[![TypeScript](https://www.vectorlogo.zone/logos/typescriptlang/typescriptlang-ar21.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript "Programming Language")
[![VectorLogoZone](https://www.vectorlogo.zone/logos/vectorlogozone/vectorlogozone-ar21.svg)](https://www.vectorlogo.zone/logos/index.html#tile "Images")
