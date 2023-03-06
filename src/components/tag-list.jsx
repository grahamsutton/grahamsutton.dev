/**
 * Bio component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.com/docs/how-to/querying-data/use-static-query/
 */

import * as React from 'react'
import { Link } from 'gatsby'

const TagList = ({ tags }) => {
  return (
    <div className="post-tag-list">
      {tags?.map(tag => (
        <Link to={`/tags/${tag}`} key={tag}>
          <div className="post-tag">{tag}</div>
        </Link>
      ))}
    </div>
  )
}

export default TagList
