import React from 'react'
import PropTypes from 'prop-types'
import { kebabCase } from 'lodash'
import { Helmet } from 'react-helmet'
import { graphql, Link } from 'gatsby'
import Layout from '../components/Layout'
import Content, { HTMLContent } from '../components/Content'
import { 
  FacebookShareButton, 
  FacebookIcon, 
  LineShareButton, 
  LineIcon,
  LinkedinShareButton, 
  LinkedinIcon,
  TwitterShareButton,
  TwitterIcon
} from 'react-share';
import WideAdsense from '../components/WideAdsense';

export const BlogPostTemplate = ({
  content,
  contentComponent,
  description,
  tags,
  title,
  helmet,
  url,
}) => {
  const PostContent = contentComponent || Content

  return (
    <section className="section">
      {helmet || ''}
      <div className="container content">
        <div className="columns">
          <div className="column is-10 is-offset-1">
            <h1 className="title is-size-2 has-text-weight-bold is-bold-light" style={{color : '#014C86'}}>
              {title}
            </h1>
            <p style={{border : '1px solid #658DC6', borderRadius : '0.5em', padding : 20}} >{description}</p>
            <WideAdsense />
            <PostContent content={content} />
            <SNSSection title={title} articleUrl={url} />
            {tags && tags.length ? (
              <div style={{ marginTop: `4rem` }}>
                <h4 style={{backgroundColor : '#014C86', display : 'inline-block', color : '#FFF', marginBottom : 10, padding : 10, borderRadius : 10}}>
                  タグ
                </h4>
                <ul className="taglist">
                  {tags.map((tag) => (
                    <li key={tag + `tag`} style={{paddingRight : 5, paddingTop : 5, paddingBottom : 5}}>
                      <Link style={{backgroundColor : '#658DC6', borderRadius : 10, padding: 10, color : '#FFF', alignContent : 'center'}} to={`/tags/${kebabCase(tag)}/`}>
                        {tag}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}

BlogPostTemplate.propTypes = {
  content: PropTypes.node.isRequired,
  contentComponent: PropTypes.func,
  description: PropTypes.string,
  title: PropTypes.string,
  helmet: PropTypes.object,
  url : PropTypes.string,
}

const BlogPost = ({ data }) => {
  const { markdownRemark: post, site } = data

  return (
    <Layout>
      <BlogPostTemplate
        content={post.html}
        contentComponent={HTMLContent}
        description={post.frontmatter.description}
        helmet={
          <Helmet titleTemplate="%s | ネコニキの開発雑記">
            <title>{`${post.frontmatter.title}`}</title>
            <meta
              name="description"
              content={`${post.frontmatter.description}`}
            />
          </Helmet>
        }
        url={`${site.siteMetadata.siteUrl}/${post.frontmatter.url}`}
        tags={post.frontmatter.tags}
        title={post.frontmatter.title}
      />
    </Layout>
  )
}

const SNSSection = ({title, articleUrl}) => {

  return (
    <div style={{marginTop : '4rem'}}>
      <h4 style={{color : '#014C86', fontWeight : 'bold', size : 'large'}}>SNSでシェアする</h4>

      <FacebookShareButton url={articleUrl}>
        <FacebookIcon size={50} round />
      </FacebookShareButton>

      <LineShareButton url={articleUrl} style={{marginLeft : '.5em'}} >
        <LineIcon size={50} round />
      </LineShareButton>

      <LinkedinShareButton url={articleUrl} style={{marginLeft : '.5em'}}>
        <LinkedinIcon title={title} size={50} round />
      </LinkedinShareButton>

      <TwitterShareButton title={title} via="@inouetakumon" url={articleUrl} style={{marginLeft : '.5em'}}>
        <TwitterIcon size={50} round />
      </TwitterShareButton>
    </div>
  )
}


BlogPost.propTypes = {
  data: PropTypes.shape({
    markdownRemark: PropTypes.object,
    site : PropTypes.object,
  }),
}

export default BlogPost

export const pageQuery = graphql`
  query BlogPostByID($id: String!) {
    markdownRemark(id: { eq: $id }) {
      id
      html
      frontmatter {
        date(formatString: "MMMM DD, YYYY")
        title
        description
        tags
        url
      }
    },
    site {
      siteMetadata {
        siteUrl
      }
    }
  }
`
