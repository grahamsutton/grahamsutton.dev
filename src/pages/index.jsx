import * as React from 'react'
import { graphql } from 'gatsby'

import Bio from '../components/bio'
import Layout from '../components/layout'
import Seo from '../components/seo'

const AboutMe = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata?.title || `Title`
  const year = new Date().getFullYear()

  return (
    <Layout location={location} title={siteTitle}>
      <h1>About me</h1>
      <p>
        Hi! My name is Graham and I am a systems architect from Miami. Welcome to my personal
        website.
      </p>
      <p>
        Here you'll find tutorials, career advice, personal thoughts and more about software development.
        Whether you're an established software developer or an aspirational one, I created this website
        to share what I've learned in my career with others.
      </p>
      <p>
        Before I was a systems architect, I was a software developer. And before I was a software developer,
        I was a waiter at a sushi restaurant where I met the woman who is now my beloved wife. That was {year - 2013} years
        ago! We welcomed our first child into the world {year === 2023 ? 'this year' : `in 2023`}
        and have never been happier.
      </p>
      <p>
        The year I met my wife is also the year when I landed my first job as a junior software developer. I remember
        getting my first paycheck for just $400 and jumping for joy and shouting (in my head), "I am getting PAID
        to do this!?". In 10 years, I went from a junior software developer taking two long weeks to print a
        line graph to now designing robust and scalable systems and managing several development teams to
        implement them. Even though I know I did a lot of "right" to get here, I am still, and will forever
        be, a student that is always improving.
      </p>
      <p>
        But before ever getting hired, I was a pretty bad software developer. And by "bad", I mean inexperienced
        compared to what I know today. However, I was "good" in the right sense - I had ambition. I had ambition
        to learn, to build, and to keep going despite knowing how "bad" I was.
      </p>
      <p>
        That ambition has evolved over the years, but it's never ceased. This is one thing about myself that I
        am most proud of - never losing my ambition. What started in the very beginning of my developer journey
        as trying "build the next Facebook" (we all go through that phase, right?) has come full circle to me
        starting this blog to hopefully inspire another "bad" and ambitious developer like myself. The countless
        blogs and articles I read from others made me the developer I am today, and inspired me to keep going
        because they helped me keep going.
      </p>
      <p>
        And so whether you've been doing this for longer than I have or you're just starting out in hopes of one
        day becoming a career software developer, I hope this blog inspires you to learn something new and to
        keep you and your ambition going.
      </p>
      <p>
        Happy reading!
      </p>
      <Bio />
    </Layout>
  )
}

export default AboutMe

/**
 * Head export to define metadata for the page
 *
 * See: https://www.gatsbyjs.com/docs/reference/built-in-components/gatsby-head/
 */
export const Head = () => <Seo title="Graham Sutton" />

export const pageQuery = graphql`
  {
    site {
      siteMetadata {
        title
      }
    }
  }
`
