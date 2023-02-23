import * as React from 'react'
import { Link, graphql } from 'gatsby'

import Bio from '../components/bio'
import Layout from '../components/layout'
import Seo from '../components/seo'

const AboutMe = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata?.title || `Title`

  return (
    <Layout location={location} title={siteTitle}>
      <h1>About me</h1>
      <p>
        Hi! My name is Graham and I am a systems architect from Miami. Welcome to my personal
        website. Here you'll find tutorials, career advice, personal thoughts and more about
        software development. Whether you're an established software developer or I created
        this website to share what I've learned with others and so I hope you learn something
        while you're here!
      </p>
      <p>
        Prior to being an architect, I was a software developer for about 8 years
        (not including my hobbyist years). I was promoted about almost a year ago and even
        though my position and doesn't require as much coding as it used to, I still love
        to tinker in my free time. When you love something, sometimes you just can't put
        it down, am I right? I hope you enjoy this site and learn something useful!
      </p>
    </Layout>
  )
}

export default AboutMe

/**
 * Head export to define metadata for the page
 *
 * See: https://www.gatsbyjs.com/docs/reference/built-in-components/gatsby-head/
 */
export const Head = () => <Seo title="All posts" />

export const pageQuery = graphql`
  {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(sort: { frontmatter: { date: DESC } }) {
      nodes {
        excerpt
        fields {
          slug
        }
        frontmatter {
          date(formatString: "MMMM DD, YYYY")
          title
          description
        }
      }
    }
  }
`
