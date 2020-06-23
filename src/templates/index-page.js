import React from 'react'
import PropTypes from 'prop-types'
import { Link, graphql } from 'gatsby'

import Layout from '../components/Layout'
import Features from '../components/Features'
import BlogRoll from '../components/BlogRoll'
import Adsense from '../components/Adsense';

export const IndexPageTemplate = ({
  image,
  title,
  heading,
  subheading,
  description,
  intro,
}) => (
  <div>
    <div
      className="full-width-image margin-top-0"
      style={{
        backgroundImage: `url(${
          !!image.childImageSharp ? image.childImageSharp.fluid.src : image
        })`,
        backgroundPosition: `top left`,
        backgroundAttachment: `fixed`,
      }}
    >
      <div
        style={{
          display: 'flex',
          height: '150px',
          lineHeight: '1',
          justifyContent: 'space-around',
          alignItems: 'left',
          flexDirection: 'column',
        }}
      >
        <h1
          className="has-text-weight-bold is-size-3-mobile is-size-2-tablet is-size-1-widescreen"
          style={{
            backgroundColor: '#014C86',
            color: '#FFF',
            lineHeight: '1',
            padding: '0.50em',
            borderRadius : '0.50em'
          }}
        >
          {title}
        </h1>
        <h3
          className="has-text-weight-bold is-size-5-mobile is-size-5-tablet is-size-4-widescreen"
          style={{
            backgroundColor: '#014C86',
            color: '#FFF',
            lineHeight: '1',
            padding: '0.50em',
            borderRadius : '0.50em',
          }}
        >
          {subheading}
        </h3>
      </div>
    </div>
    <section className="section section--gradient">
      <div className="container">
        <div className="section">
          <div className="columns">
            <div className="column is-10 is-offset-1">
              <div className="content">
              <div className="column is-12">
                <Adsense />
              </div>
                <div className="column is-12">
                  <h3 className="has-text-weight-semibold is-size-2" style={{backgroundColor : '#658DC6', color : '#FFF', padding : 15, borderRadius : '0.50em', }}>
                    {heading}
                  </h3>
                  <p>{description}</p>
                </div>
                <div className="column is-12">
                  <h3 className="has-text-weight-semibold is-size-2" style={{backgroundColor : '#658DC6', color : '#FFF', padding : 15, borderRadius : '0.50em'}}>
                    主要カテゴリー
                  </h3>
                  <Features gridItems={intro.blurbs} />
                </div>
                <div className="column is-12">
                  <h3 className="has-text-weight-semibold is-size-2" style={{backgroundColor : '#658DC6', color : '#FFF', padding : 15, borderRadius : '0.50em'}}>
                    投稿記事一覧
                  </h3>
                  <BlogRoll />
                  <div className="column is-12 has-text-centered">
                    <Link className="btn" to="/blog" style={{color : '#014C86'}}>
                      もっと見る
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
)

IndexPageTemplate.propTypes = {
  image: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  title: PropTypes.string,
  heading: PropTypes.string,
  subheading: PropTypes.string,
  description: PropTypes.string,
  intro: PropTypes.shape({
    blurbs: PropTypes.array,
  }),
}

const IndexPage = ({ data }) => {
  const { frontmatter } = data.markdownRemark

  return (
    <Layout>
      <IndexPageTemplate
        image={frontmatter.image}
        title={frontmatter.title}
        heading={frontmatter.heading}
        subheading={frontmatter.subheading}
        description={frontmatter.description}
        intro={frontmatter.intro}
      />
    </Layout>
  )
}

IndexPage.propTypes = {
  data: PropTypes.shape({
    markdownRemark: PropTypes.shape({
      frontmatter: PropTypes.object,
    }),
  }),
}

export default IndexPage

export const pageQuery = graphql`
  query IndexPageTemplate {
    markdownRemark(frontmatter: { templateKey: { eq: "index-page" } }) {
      frontmatter {
        title
        image {
          childImageSharp {
            fluid(maxWidth: 2048, quality: 100) {
              ...GatsbyImageSharpFluid
            }
          }
        }
        heading
        subheading
        description
        intro {
          blurbs {
            image {
              childImageSharp {
                fluid(maxWidth: 240, quality: 64) {
                  ...GatsbyImageSharpFluid
                }
              }
            }
            text
            tag
          }
          heading
          description
        }
      }
    }
  }
`
