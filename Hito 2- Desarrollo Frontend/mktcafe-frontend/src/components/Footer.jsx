const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mk-footer">
      <span className="mk-footer-logo">MktCafé</span>
      <span className="mk-footer-copy">© {currentYear} · Marketplace de café artesanal</span>
    </footer>
  )
}

export default Footer
