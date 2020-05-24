import React from 'react'
import { Helmet } from 'react-helmet'
import { Link, graphql } from 'gatsby'
import Layout from '../components/Layout'
import PreviewCompatibleImage from '../components/PreviewCompatibleImage'

class TagRoute extends React.Component {
  render() {
    const posts = this.props.data.allMarkdownRemark.edges
    const postLinks = posts.map((post) => (
      <li key={post.node.fields.slug} >
        <Link to={post.node.fields.slug}>
          <article style={{backgroundColor : '#EAEAEA', borderColor : '#000', borderTopWidth : 1, borderRadius : '0.5em', paddingLeft : 10, paddingRight : 10}}>
            <h2 className="is-size-2" style={{color : '#014C86', marginBottom : 0}}>
              {post.node.frontmatter.title}
            </h2>
            <p style={{color : '#658DC6'}}>
              {post.node.frontmatter.description}
            </p>
            <p style={{color : '#658DC6'}}>
              {post.node.frontmatter.date}
            </p>
          </article>
        </Link>
      </li>
    ))
    const tag = this.props.pageContext.tag
    const title = this.props.data.site.siteMetadata.title
    const totalCount = this.props.data.allMarkdownRemark.totalCount
    const tagName = `“${tag}”`;
    const tagHeader = `では ${totalCount} 件${
      totalCount === 1 ? '' : ''
    } の投稿が見つかりました `

    return (
      <Layout>
        <section className="section">
          <Helmet title={`${tag} | ${title}`} />
          <div className="container content">
            <div className="columns">
              <div
                className="column is-10 is-offset-1"
                style={{ marginBottom: '6rem' }}
              >
                <h3 className="title is-size-4 is-bold-light">
                  <div style={{color : '#014C86', display : 'inline-block'}}>{tagName}</div>{tagHeader}
                </h3>
                <ul className="taglist">
                  {postLinks}
                </ul>
                <p>
                  <Link className="btn" to="/tags/" style={{borderColor : '#014C86', color : '#014C86'}}>全てのタグを表示する</Link>
                </p>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    )
  }
}

export default TagRoute

export const tagPageQuery = graphql`
  query TagPage($tag: String) {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(
      limit: 1000
      sort: { fields: [frontmatter___date], order: DESC }
      filter: { frontmatter: { tags: { in: [$tag] } } }
    ) {
      totalCount
      edges {
        node {
          fields {
            slug
          }
          frontmatter {
            title
            description
            date(formatString: "YYYY.MM.DD")
            featuredimage {
              childImageSharp {
                fluid(maxWidth: 120, quality: 100) {
                  ...GatsbyImageSharpFluid
                }
              }
            }
          }
        }
      }
    }
  }
`
