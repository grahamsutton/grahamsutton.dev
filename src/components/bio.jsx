/**
 * Bio component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.com/docs/how-to/querying-data/use-static-query/
 */

import * as React from "react"
import { useStaticQuery, graphql } from "gatsby"
import { StaticImage } from "gatsby-plugin-image"

const Bio = () => {
  const data = useStaticQuery(graphql`
    query BioQuery {
      site {
        siteMetadata {
          author {
            name
            summary
          }
          social {
            twitter
          }
        }
      }
    }
  `)

  // Set these values by editing "siteMetadata" in gatsby-config.js
  const author = data.site.siteMetadata?.author
  const social = data.site.siteMetadata?.social

  return (
    <div className="bio">
      <StaticImage
        className="bio-avatar"
        layout="fixed"
        formats={["auto", "webp", "avif"]}
        src="../images/profile-pic.jpg"
        width={50}
        height={50}
        quality={95}
        alt="Profile picture"
      />
      {author?.name && (
        <div>
          <strong>{author.name}</strong>
          <div className="flex items-center">
            {author?.summary || 'works '} at&nbsp;
            <a className="sproutloud" href="https://sproutloud.com" target="_blank" rel="noopener noreferrer">
              <span>SproutLoud</span> <StaticImage alt="SproutLoud icon" src="../images/sproutloud.png" height={24} width={24} />
            </a>
          </div>
          {` `}
          <a href={`https://twitter.com/${social?.twitter || ``}`} target="_blank" rel="noopener noreferrer">
            Follow me on Twitter if you want
          </a>
        </div>
      )}
    </div>
  )
}

export default Bio
