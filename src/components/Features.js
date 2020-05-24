import React from 'react'
import PropTypes from 'prop-types'
import PreviewCompatibleImage from '../components/PreviewCompatibleImage'
import { kebabCase } from 'lodash'
import { graphql, Link } from 'gatsby'

const FeatureGrid = ({ gridItems }) => (
  <div className="columns is-multiline">
    {gridItems.map((item) => (
      <div key={item.text} className="is-parent column is-6">
        <Link　to={`/tags/${kebabCase(item.tag)}/`}>
          <article className="blog-list-item tile is-child box notification " >
            <h2 style={{color : '#014C86'}}>{item.tag}</h2>
              <section className="section" style={{borderRadius : '0.5em', padding : 10}}>
                <div className="has-text-centered">
                  <div
                    style={{
                      width: '240px',
                      display: 'inline-block',
                    }}
                  >
                    <PreviewCompatibleImage imageInfo={item} />
                  </div>
                </div>
              </section>
            <p>{item.text}</p>
          </article>
        </Link>
      </div>
    ))}
  </div>
)

FeatureGrid.propTypes = {
  gridItems: PropTypes.arrayOf(
    PropTypes.shape({
      image: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
      text: PropTypes.string,
      tag: PropTypes.string,
    })
  ),
}

export default FeatureGrid
