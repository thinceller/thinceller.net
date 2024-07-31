import React from 'react'

function MyLink(props) {
  return (
    <a href={props.url} target="_blank" rel="noopener noreferrer">
      {props.children}
      <style jsx>{`
        a {
          color: blue;
          text-decoration: none;
        }
      `}</style>
    </a>
  )
}

export function Profile() {
  return (
    <section>
      <h2>Profile</h2>
      <p>thinceller - Kohei Kawakami<br/>Web Developer</p>
      <p>
        <MyLink url="https://twitter.com/thinceller_dev">
          Twitter
        </MyLink>
        {' / '}
        <MyLink url="https://github.com/thinceller">
          GitHub
        </MyLink>
      </p>
    </section>
  )
}
