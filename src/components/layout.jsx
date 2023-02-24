import * as React from 'react'
import { Link } from 'gatsby'

const Layout = ({ location, title, children }) => {
  const isNavPath = ['/', '/blog/'].includes(location.pathname)
  let header

  if (isNavPath) {
    header = (
      <h1 className="main-heading">
        <Link to="/">{title}</Link>
      </h1>
    )
  } else {
    header = (
      <Link className="header-link-home" to="/">
        {title}
      </Link>
    )
  }

  return (
    <div className="global-wrapper" data-is-root-path={isNavPath}>
      <header className="global-header">
        <div className="global-header__title">
          {header}
        </div>
        <nav className="global-nav">
          <Link to="/">About</Link>
          <Link to="/blog">Blog</Link>
          <a href="https://github.com/grahamsutton" target="_blank" rel="noopener noreferrer">GitHub</a>
        </nav>
      </header>
      <main>{children}</main>
      <footer>
        © {new Date().getFullYear()} Graham Sutton
      </footer>
    </div>
  )
}

export default Layout
